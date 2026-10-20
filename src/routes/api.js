import { Hono } from 'hono';
import { DbClient } from '../db/client.js';
import { PaymentProcessorManager } from '../gateways/PaymentProcessorManager.js';
import { requireApiClient, requireAdminSession } from '../utils/apiAuth.js';
import { buildWebhookPayload, deliverWebhook } from '../utils/webhookDispatcher.js';
import { rateLimit, clientIp, validateWebhookUrl, safeEqual } from '../utils/security.js';

export const apiRoutes = new Hono();
const manager = new PaymentProcessorManager();

const FINAL_STATUSES = ['success', 'failed'];

const DEFAULT_PENDING_TIMEOUT_MINUTES = 30;

/**
 * How long (in minutes) a transaction may stay "pending" before the processor
 * gives up on it. 0 disables expiry.
 */
export async function getPendingTimeoutMinutes(dbClient) {
  const raw = await dbClient.getConfig('pending_timeout_minutes', '');
  if (raw === '' || raw === null || raw === undefined) return DEFAULT_PENDING_TIMEOUT_MINUTES;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_PENDING_TIMEOUT_MINUTES;
}

/**
 * Marks a pending transaction as failed once it has outlived the configured
 * pending timeout, and notifies the web app. Returns the (possibly updated) log
 * and whether it was expired by this call.
 *
 * A late gateway callback reporting success is still honoured afterwards: the
 * callback handler only refuses to downgrade a *successful* payment, so a
 * failed-by-timeout payment can still be upgraded to success.
 */
export async function expirePendingIfStale(dbClient, env, log, executionCtx = null) {
  if (!log || log.status !== 'pending') return { log, expired: false };

  const timeoutMinutes = await getPendingTimeoutMinutes(dbClient);
  if (!timeoutMinutes) return { log, expired: false };

  const createdMs = Date.parse(log.created_at);
  if (!Number.isFinite(createdMs)) return { log, expired: false };

  const ageMinutes = (Date.now() - createdMs) / 60000;
  if (ageMinutes < timeoutMinutes) return { log, expired: false };

  const message = `Payment expired: no confirmation from ${log.gateway} within ${timeoutMinutes} minutes (customer did not complete the prompt).`;
  await dbClient.updatePaymentLog(log.id, {
    status: 'failed',
    raw_response: {
      ...(log.raw_response && typeof log.raw_response === 'object' ? log.raw_response : {}),
      _expired: true,
      _expired_at: new Date().toISOString(),
      _expired_reason: message,
    },
  });
  console.log(`Expired pending payment ${log.external_reference} after ${Math.floor(ageMinutes)} minutes`);

  const fresh = await dbClient.findPaymentLogById(log.id);
  const payload = buildWebhookPayload(fresh, message, { source: 'pending_timeout' });
  const delivery = await deliverWebhook(dbClient, env, payload, { executionCtx });
  if (!delivery.delivered && !delivery.skipped) {
    console.error(`Failed to notify WebApp about expired payment ${fresh.external_reference}: ${delivery.detail}`);
  }
  return { log: fresh, expired: true };
}

/**
 * Scheduled sweep: finalise pending transactions that have outlived the timeout.
 * Each one gets a last live status check with its gateway before being expired.
 */
export async function sweepStalePendingPayments(dbClient, env, executionCtx = null, limit = 50) {
  const timeoutMinutes = await getPendingTimeoutMinutes(dbClient);
  if (!timeoutMinutes) return { checked: 0, expired: 0, finalized: 0 };

  const cutoff = new Date(Date.now() - timeoutMinutes * 60000).toISOString();
  const stale = await dbClient.getStalePendingLogs(cutoff, limit);
  let expired = 0;
  let finalized = 0;
  for (const log of stale) {
    try {
      const res = await performStatusCheck(dbClient, log.external_reference, env, executionCtx);
      if (res.payload && res.payload.expired) expired += 1;
      else if (res.payload && res.payload.status !== 'pending') finalized += 1;
    } catch (e) {
      console.error(`Sweep failed for ${log.external_reference}:`, e);
    }
  }
  return { checked: stale.length, expired, finalized };
}

function getExecutionCtx(c) {
  try {
    return c.executionCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Shared status check helper
 */
export async function performStatusCheck(dbClient, externalRef, env = {}, executionCtx = null) {
  let log = await dbClient.findPaymentLogByRef(externalRef);
  if (!log) {
    log = await dbClient.findPaymentLogByGatewayRef(externalRef);
  }
  if (!log) {
    return {
      statusCode: 404,
      payload: { success: false, message: 'Payment log not found', external_reference: externalRef },
    };
  }

  let checkedRemote = false;
  let remoteCheckResult = null;

  // If status is still pending, check live with the gateway (AzamPay / Selcom)
  if (log.status === 'pending') {
    try {
      const gatewayObj = await manager.getGateway(dbClient, log.gateway);
      if (gatewayObj && typeof gatewayObj.checkTransactionStatus === 'function') {
        checkedRemote = true;
        remoteCheckResult = await gatewayObj.checkTransactionStatus(dbClient, log.external_reference, log.gateway_reference);

        if (remoteCheckResult && remoteCheckResult.success && remoteCheckResult.status !== 'pending') {
          await dbClient.updatePaymentLog(log.id, {
            status: remoteCheckResult.status,
            gateway_reference: remoteCheckResult.gateway_reference || log.gateway_reference,
            raw_response: remoteCheckResult.raw_response || null,
          });

          log = await dbClient.findPaymentLogById(log.id);

          const payload = buildWebhookPayload(
            log,
            `Status updated via direct gateway check: ${remoteCheckResult.message || log.status}`,
            { source: 'status_query' }
          );
          await deliverWebhook(dbClient, env, payload, { executionCtx });
        }
      }
    } catch (e) {
      console.error(`Status check error for gateway ${log.gateway}:`, e);
    }
  }

  // Still pending after the live check: give up once the pending timeout has elapsed
  let expired = false;
  if (log.status === 'pending') {
    const result = await expirePendingIfStale(dbClient, env, log, executionCtx);
    log = result.log;
    expired = result.expired;
  }

  return {
    statusCode: 200,
    payload: {
      success: true,
      external_reference: log.external_reference,
      status: log.status,
      amount: log.amount,
      gateway: log.gateway,
      gateway_reference: log.gateway_reference,
      checked_remote: checkedRemote,
      expired,
      remote_detail: expired
        ? 'Pending timeout elapsed without gateway confirmation; marked as failed.'
        : remoteCheckResult ? remoteCheckResult.message : null,
      message:
        log.status === 'success'
          ? 'Payment completed successfully'
          : log.status === 'failed'
          ? 'Payment failed'
          : 'Payment is pending',
      created_at: log.created_at,
      updated_at: log.updated_at,
    },
  };
}

// ---------------------------------------------------------------------------
// Web application API (API key or admin session required)
// ---------------------------------------------------------------------------
apiRoutes.use('/v1/payments/initiate', requireApiClient);
apiRoutes.use('/v1/payments/status/*', requireApiClient);
apiRoutes.use('/v1/payments/check-status', requireApiClient);
apiRoutes.use('/v1/environment', requireApiClient);

// Privileged / administrative endpoints (dashboard session only)
apiRoutes.use('/v1/payments/mark-paid', requireAdminSession);
apiRoutes.use('/v1/config', requireAdminSession);
apiRoutes.use('/v1/logs', requireAdminSession);
apiRoutes.use('/v1/requests', requireAdminSession);

// GET /api/v1/environment (lets the web app verify which mode the processor is running in)
apiRoutes.get('/v1/environment', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const mode = (await dbClient.getConfig('environment_mode', 'sandbox')) === 'live' ? 'live' : 'sandbox';
  return c.json({
    success: true,
    environment_mode: mode,
    is_sandbox: mode === 'sandbox',
    active_gateway: await dbClient.getConfig('active_gateway', 'selcom'),
    available_gateways: manager.getAvailableDrivers(),
    emulator_enabled: mode === 'sandbox',
    server_time: new Date().toISOString(),
  });
});

// POST /api/v1/payments/initiate
apiRoutes.post('/v1/payments/initiate', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ success: false, message: 'Invalid JSON request body' }, 400);
  }

  const { amount, phone, external_reference, email, name, gateway: reqGateway, remarks } = body;

  if (!amount || isNaN(amount) || Number(amount) < 1) {
    return c.json({ success: false, message: 'The amount field is required and must be at least 1.' }, 400);
  }
  if (!phone || !/^[0-9+\s-]{9,16}$/.test(String(phone))) {
    return c.json({ success: false, message: 'The phone field is required and must be a valid phone number.' }, 400);
  }
  if (!external_reference || String(external_reference).length > 128) {
    return c.json({ success: false, message: 'The external_reference field is required (max 128 characters).' }, 400);
  }

  // Protect against duplicate initiation of the same order while it is pending or already paid
  const existing = await dbClient.findPaymentLogByRef(String(external_reference));
  if (existing && existing.status === 'success') {
    return c.json(
      {
        success: false,
        external_reference,
        status: existing.status,
        message: 'A payment with this external_reference has already completed successfully.',
      },
      409
    );
  }

  // Tighter per-phone throttle to stop USSD push spam
  const phoneOk = await rateLimit(c.env, {
    binding: 'API_RATE_LIMITER',
    key: `initiate:${String(phone).replace(/\D/g, '')}`,
    limit: 5,
    periodSec: 60,
  });
  if (!phoneOk) {
    return c.json({ success: false, message: 'Too many payment requests for this phone number. Try again shortly.' }, 429);
  }

  const gatewayName = reqGateway || (await dbClient.getConfig('active_gateway', 'selcom'));

  let gateway;
  try {
    gateway = await manager.getGateway(dbClient, gatewayName);
  } catch (e) {
    return c.json({ success: false, message: e.message }, 400);
  }

  const logId = await dbClient.createPaymentLog({
    external_reference: String(external_reference),
    gateway: gateway.getName(),
    amount: parseFloat(amount),
    phone: String(phone),
    status: 'pending',
    raw_request: body,
  });

  const originUrl = new URL(c.req.url).origin;

  const result = await gateway.initiatePayment(
    dbClient,
    {
      amount,
      phone,
      email,
      name,
      external_reference,
      remarks,
      provider: body.provider,
      environment: body.environment,
    },
    originUrl
  );

  await dbClient.updatePaymentLog(logId, {
    gateway_reference: result.gateway_reference || null,
    status: result.success ? 'pending' : 'failed',
    raw_response: result.raw_response || null,
  });

  if (result.success) {
    return c.json({
      success: true,
      external_reference,
      gateway_reference: result.gateway_reference,
      payment_url: result.payment_url,
      message: 'Payment initiated successfully.',
    });
  }

  return c.json(
    {
      success: false,
      external_reference,
      message: result.error || 'Gateway initiation failed.',
    },
    502
  );
});

// GET /api/v1/payments/status/:external_reference
apiRoutes.get('/v1/payments/status/:external_reference', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const externalRef = c.req.param('external_reference');
  const res = await performStatusCheck(dbClient, externalRef, c.env, getExecutionCtx(c));
  return c.json(res.payload, res.statusCode);
});

// POST /api/v1/payments/check-status
apiRoutes.post('/v1/payments/check-status', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  let body = {};
  try { body = await c.req.json(); } catch (e) {}
  const externalRef = body.external_reference || body.external_id || body.order_id;
  if (!externalRef) {
    return c.json({ success: false, message: 'external_reference field is required.' }, 400);
  }
  const res = await performStatusCheck(dbClient, externalRef, c.env, getExecutionCtx(c));
  return c.json(res.payload, res.statusCode);
});

// POST /api/v1/payments/mark-paid (ADMIN ONLY: manually mark payment as success & trigger WebApp callback)
apiRoutes.post('/v1/payments/mark-paid', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  let body = {};
  try { body = await c.req.json(); } catch (e) {}

  const externalRef = body.external_reference || body.external_id || body.order_id;
  if (!externalRef) {
    return c.json({ success: false, message: 'external_reference field is required.' }, 400);
  }

  let log = await dbClient.findPaymentLogByRef(externalRef);
  if (!log) {
    return c.json({ success: false, message: 'Payment log record not found.' }, 404);
  }

  const adminUser = c.get('adminUser') || 'admin';
  const gatewayRef = body.gateway_reference || log.gateway_reference || `MANUAL-${Date.now()}`;

  await dbClient.updatePaymentLog(log.id, {
    status: 'success',
    gateway_reference: gatewayRef,
  });
  console.warn(`[AUDIT] Admin "${adminUser}" manually marked ${log.external_reference} as paid from ${clientIp(c)}`);

  log = await dbClient.findPaymentLogById(log.id);

  const payload = buildWebhookPayload(log, `Payment status manually confirmed by administrator (${adminUser})`, {
    source: 'manual',
  });
  const delivery = await deliverWebhook(dbClient, c.env, payload, { executionCtx: getExecutionCtx(c) });

  return c.json({
    success: true,
    external_reference: log.external_reference,
    status: 'success',
    amount: log.amount,
    gateway: log.gateway,
    gateway_reference: log.gateway_reference,
    callback_delivered: delivery.delivered,
    callback_detail: delivery.detail,
    event_id: delivery.event_id || null,
    message: 'Payment status manually updated to SUCCESS and webhook callback triggered.',
  });
});

// ---------------------------------------------------------------------------
// Gateway webhook callbacks (AzamPay / Selcom -> processor)
// ---------------------------------------------------------------------------

function parseCallbackBody(rawBody, contentType = '') {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch (e) {
    // fall through
  }
  if (contentType.includes('application/x-www-form-urlencoded') || /^[^=&\s]+=[^&]*(&[^=&\s]+=[^&]*)*$/.test(rawBody.trim())) {
    try {
      return Object.fromEntries(new URLSearchParams(rawBody).entries());
    } catch (e) {
      return {};
    }
  }
  return {};
}

function candidateReferences(bodyData) {
  return [
    bodyData.utilityref,
    bodyData.externalId,
    bodyData.externalreference,
    bodyData.external_reference,
    bodyData.order_id,
    bodyData.reference,
    bodyData.transid,
    bodyData.transactionId,
    bodyData.mnoreference,
  ]
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
    .map((v) => String(v));
}

function detectGatewayFromBody(bodyData) {
  if (
    bodyData.utilityref ||
    bodyData.mnoreference ||
    bodyData.operator ||
    bodyData.transactionstatus ||
    (bodyData.reference && String(bodyData.reference).startsWith('AZM'))
  ) {
    return 'azampay';
  }
  if (bodyData.order_id || (bodyData.transid && !bodyData.utilityref)) {
    return 'selcom';
  }
  return null;
}

/**
 * Universal webhook callback handler for all gateways and paths.
 *
 * Security model:
 *  - The transaction is resolved from OUR database first, so the body cannot
 *    choose which gateway's verifier runs.
 *  - A cryptographically valid gateway signature is trusted directly.
 *  - A callback without a signature (or with a stale timestamp) is treated as a
 *    hint only: the processor queries the gateway's status API and applies what
 *    the gateway says, never what the callback claims.
 *  - When the gateway offers no usable status API (AzamPay MNO checkout), an
 *    unsigned callback is accepted only if it is bound to the transaction: it
 *    must quote the gateway reference the gateway itself issued at initiation,
 *    the amount must match, and any phone number it carries must match.
 *  - A callback with a present but invalid signature is rejected.
 *  - Amount must match the initiated amount; a completed payment is never downgraded.
 *  - Callbacks for unknown transactions are acknowledged but never forwarded.
 */
async function handleGatewayCallback(c, explicitGateway = null) {
  const dbClient = new DbClient(c.env.DB);

  const ip = clientIp(c);
  const allowed = await rateLimit(c.env, { binding: 'API_RATE_LIMITER', key: `callback:${ip}`, limit: 120, periodSec: 60 });
  if (!allowed) {
    return c.json({ success: false, message: 'Rate limit exceeded.' }, 429);
  }

  const rawBody = await c.req.text().catch(() => '');
  const bodyData = parseCallbackBody(rawBody, c.req.header('content-type') || '');
  const pathGateway = explicitGateway || c.req.param('gateway') || null;

  // 1. Resolve the transaction from our own records first
  let log = null;
  for (const ref of candidateReferences(bodyData)) {
    log = (await dbClient.findPaymentLogByRef(ref)) || (await dbClient.findPaymentLogByGatewayRef(ref));
    if (log) break;
  }

  let gatewayName = pathGateway ? String(pathGateway).toLowerCase() : null;
  if (log) {
    if (gatewayName && gatewayName !== log.gateway) {
      console.warn(`Callback path gateway [${gatewayName}] does not match stored gateway [${log.gateway}] for ${log.external_reference}`);
      return c.json({ success: false, message: 'Gateway mismatch for referenced transaction.' }, 400);
    }
    gatewayName = log.gateway;
  }
  if (!gatewayName) {
    gatewayName = detectGatewayFromBody(bodyData) || (await dbClient.getConfig('active_gateway', 'azampay'));
  }

  console.log(`Incoming callback for gateway [${gatewayName}] from ${ip}`, {
    path: c.req.path,
    matched: !!log,
    reference: log ? log.external_reference : candidateReferences(bodyData)[0] || null,
  });

  let gateway;
  try {
    gateway = await manager.getGateway(dbClient, gatewayName);
  } catch (e) {
    return c.json({ success: false, message: 'Unsupported gateway.' }, 400);
  }

  // 2. Signature verification: 'valid' | 'invalid' | 'unsigned'
  const sigState = normalizeSignatureState(
    await gateway.verifyWebhookSignature(dbClient, c.req.raw.headers, rawBody, bodyData)
  );
  if (sigState === 'invalid') {
    console.warn(`Callback signature verification FAILED for gateway: ${gatewayName}`);
    return c.json({ success: false, message: 'Invalid signature' }, 403);
  }

  if (!log) {
    console.warn(`Callback ignored: no matching transaction (gateway=${gatewayName}, signature=${sigState})`);
    return c.json({ success: true, status: 'acknowledged', applied: false, reason: 'unknown_transaction' });
  }

  let parsed = gateway.parseCallback(bodyData);
  let confirmation = sigState === 'valid' ? 'signature' : null;

  // 3. Unsigned callbacks are confirmed against the gateway's status API
  if (sigState !== 'valid') {
    let remote = null;
    try {
      remote = await gateway.checkTransactionStatus(dbClient, log.external_reference, log.gateway_reference || parsed.gateway_reference);
    } catch (e) {
      console.error('Gateway status confirmation failed:', e);
    }
    if (remote && remote.success && FINAL_STATUSES.includes(remote.status)) {
      parsed = {
        ...parsed,
        status: remote.status,
        gateway_reference: remote.gateway_reference || parsed.gateway_reference,
        message: remote.message || parsed.message,
      };
      confirmation = 'status_query';
    } else if (callbackBoundToTransaction(log, bodyData, parsed)) {
      // The gateway cannot be asked, but the callback quotes the gateway's own
      // reference for this exact transaction and is consistent with our record.
      confirmation = 'reference_match';
      console.log(`Unsigned callback for ${log.external_reference} accepted via gateway reference match (${log.gateway_reference}).`);
    } else {
      console.warn(`Unsigned callback for ${log.external_reference} could not be confirmed with ${gatewayName}; status unchanged.`);
      return c.json(
        {
          success: true,
          status: 'acknowledged',
          applied: false,
          reason: 'unsigned_callback_unconfirmed',
          message: 'Callback was not signed and the gateway did not confirm a final status. No changes applied.',
        },
        202
      );
    }
  }

  // 4. Amount integrity (only when the callback carries an amount)
  if (parsed.status === 'success' && parsed.amount > 0 && Math.abs(parsed.amount - Number(log.amount)) > 0.009) {
    console.warn(`Callback amount mismatch for ${log.external_reference}: expected ${log.amount}, got ${parsed.amount}`);
    await dbClient.updatePaymentLog(log.id, { callback_payload: { ...bodyData, _rejected: 'amount_mismatch' } });
    return c.json({ success: false, message: 'Amount mismatch for referenced transaction.' }, 400);
  }

  // 5. Status state machine: never downgrade a completed payment, ignore duplicates
  if (log.status === 'success' && parsed.status !== 'success') {
    return c.json({ success: true, status: 'acknowledged', applied: false, reason: 'already_completed' });
  }
  if (log.status === parsed.status && FINAL_STATUSES.includes(log.status)) {
    return c.json({ success: true, status: 'acknowledged', applied: false, reason: 'duplicate' });
  }

  await dbClient.updatePaymentLog(log.id, {
    gateway_reference: parsed.gateway_reference || log.gateway_reference,
    status: parsed.status,
    callback_payload: bodyData,
  });
  console.log(`Updated payment log ID ${log.id} (${log.external_reference}) status to ${parsed.status} [confirmed via ${confirmation}]`);

  log = await dbClient.findPaymentLogById(log.id);

  // 6. Forward normalized, signed notification to the web application
  const payload = buildWebhookPayload(log, parsed.message, { source: 'gateway_callback' });
  const delivery = await deliverWebhook(dbClient, c.env, payload, { executionCtx: getExecutionCtx(c) });
  if (!delivery.delivered && !delivery.skipped) {
    console.error(`Failed to forward callback to WebApp: ${delivery.detail}`);
  }

  return c.json({ success: true, status: 'acknowledged', applied: true });
}

/**
 * An unsigned callback is "bound" to a transaction when it quotes the gateway
 * reference that the gateway issued to us at initiation (which outsiders do not
 * know), and everything else it says agrees with our record.
 */
function callbackBoundToTransaction(log, bodyData, parsed) {
  const stored = log.gateway_reference ? String(log.gateway_reference).trim() : '';
  if (!stored) return false;

  const quoted = [
    bodyData.reference,
    bodyData.transid,
    bodyData.transactionId,
    bodyData.mnoreference,
    bodyData.externalreference,
    bodyData.fspReferenceId,
    parsed.gateway_reference,
  ]
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
    .map((v) => String(v).trim());
  if (!quoted.some((v) => safeEqual(v, stored))) return false;

  if (parsed.amount > 0 && Math.abs(parsed.amount - Number(log.amount)) > 0.009) return false;

  const digits = (v) => String(v || '').replace(/\D/g, '');
  const callbackPhone = digits(parsed.phone);
  const storedPhone = digits(log.phone);
  if (callbackPhone && storedPhone && callbackPhone.slice(-9) !== storedPhone.slice(-9)) return false;

  return true;
}

function normalizeSignatureState(result) {
  if (result === true) return 'valid';
  if (result === false) return 'invalid';
  if (result === 'valid' || result === 'invalid' || result === 'unsigned') return result;
  return 'invalid';
}

const callbackReady = (label) => async (c) => c.json({ success: true, message: `${label} callback endpoint is ready.` });

// Callback endpoints (GET for health check, POST for real webhook processing)
apiRoutes.get('/v1/callbacks/:gateway', callbackReady('Gateway'));
apiRoutes.post('/v1/callbacks/:gateway', (c) => handleGatewayCallback(c));

apiRoutes.get('/v1/callbacks', callbackReady('Gateway'));
apiRoutes.post('/v1/callbacks', (c) => handleGatewayCallback(c));

apiRoutes.get('/callbacks/:gateway', callbackReady('Gateway'));
apiRoutes.post('/callbacks/:gateway', (c) => handleGatewayCallback(c));

apiRoutes.get('/callbacks', callbackReady('Gateway'));
apiRoutes.post('/callbacks', (c) => handleGatewayCallback(c));

apiRoutes.get('/payments/callback', callbackReady('Payments'));
apiRoutes.post('/payments/callback', (c) => handleGatewayCallback(c));

apiRoutes.get('/v1/payments/callback', callbackReady('Payments'));
apiRoutes.post('/v1/payments/callback', (c) => handleGatewayCallback(c));

// ---------------------------------------------------------------------------
// Admin configuration & inspection (dashboard session only)
// ---------------------------------------------------------------------------

// GET /api/v1/config
apiRoutes.get('/v1/config', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  return c.json({
    active_gateway: await dbClient.getConfig('active_gateway', 'selcom'),
    webapp_callback_url: await dbClient.getConfig('webapp_callback_url'),
    available_gateways: manager.getAvailableDrivers(),
  });
});

// POST /api/v1/config
apiRoutes.post('/v1/config', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));

  if (body.active_gateway) {
    if (!['selcom', 'azampay'].includes(body.active_gateway)) {
      return c.json({ success: false, message: 'Invalid active_gateway value' }, 400);
    }
    await dbClient.setConfig('active_gateway', body.active_gateway);
  }

  if (body.webapp_callback_url !== undefined) {
    const check = validateWebhookUrl(body.webapp_callback_url);
    if (!check.ok) {
      return c.json({ success: false, message: check.error }, 400);
    }
    await dbClient.setConfig('webapp_callback_url', check.url);
  }

  return c.json({
    success: true,
    message: 'Configuration updated successfully.',
    active_gateway: await dbClient.getConfig('active_gateway', 'selcom'),
    webapp_callback_url: await dbClient.getConfig('webapp_callback_url'),
  });
});

// GET /api/v1/logs
apiRoutes.get('/v1/logs', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const search = c.req.query('search') || '';
  const gateway = c.req.query('gateway') || '';
  const status = c.req.query('status') || '';
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = Math.min(parseInt(c.req.query('per_page') || '10', 10), 100);

  const logs = await dbClient.getPaymentLogs({ search, gateway, status, page, perPage });
  return c.json(logs);
});

// GET /api/v1/requests (For Request & Response Inspector)
apiRoutes.get('/v1/requests', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const search = c.req.query('search') || '';
  const direction = c.req.query('direction') || '';
  const status = c.req.query('status') || '';
  const method = c.req.query('method') || '';
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = Math.min(parseInt(c.req.query('per_page') || '20', 10), 100);

  const logs = await dbClient.getRequestLogs({ search, direction, status, method, page, perPage });
  return c.json(logs);
});

/**
 * Signed, retried delivery of payment status webhooks to the web application.
 *
 * Every delivery carries:
 *   X-PP-Event-Id    unique id for idempotency (also in the body as `event_id`)
 *   X-PP-Event-Type  payment.success | payment.failed | payment.pending
 *   X-PP-Timestamp   unix seconds at signing time
 *   X-PP-Signature   t=<timestamp>,v1=<hex HMAC-SHA256(secret, `${timestamp}.${rawBody}`)>
 *
 * The web application must recompute the HMAC over the exact raw body and
 * reject anything older than a few minutes. See webapp_integration_guide.md.
 */

import { hmacSha256, randomId } from './security.js';
import { getWebhookSecret } from './apiAuth.js';
import { logOutboundRequest } from './outboundLogger.js';

const RETRY_DELAYS_MS = [2000, 6000, 15000];
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Build the normalized webhook body from the processor's own payment log row.
 * Fields come from our database, never straight from a gateway callback body.
 */
export function buildWebhookPayload(log, message, extra = {}) {
  return {
    event_id: randomId('evt_'),
    external_reference: log.external_reference,
    gateway: log.gateway,
    gateway_reference: log.gateway_reference || null,
    amount: log.amount,
    status: log.status,
    phone: log.phone,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

export async function signWebhook(secret, rawBody, timestamp = Math.floor(Date.now() / 1000)) {
  const mac = await hmacSha256(secret, `${timestamp}.${rawBody}`);
  return { timestamp, header: `t=${timestamp},v1=${mac}` };
}

async function attemptDelivery(dbClient, url, payload, rawBody, secret, attempt) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'PaymentProcessor-Webhook/1.0',
    'X-PP-Event-Id': payload.event_id,
    'X-PP-Event-Type': `payment.${payload.status}`,
    'X-PP-Delivery-Attempt': String(attempt),
  };

  if (secret) {
    const { timestamp, header } = await signWebhook(secret, rawBody);
    headers['X-PP-Timestamp'] = String(timestamp);
    headers['X-PP-Signature'] = header;
  }

  const start = Date.now();
  let status = null;
  let responseText = '';
  let error = null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: rawBody,
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    status = res.status;
    responseText = await res.text().catch(() => '');
  } catch (e) {
    error = e.message || String(e);
  }

  await logOutboundRequest(dbClient, {
    method: 'POST',
    url,
    headers,
    requestBody: payload,
    responseStatus: status,
    responseBody: error ? { error, attempt } : responseText,
    durationMs: Date.now() - start,
    externalReference: payload.external_reference,
    gateway: payload.gateway || null,
  });

  const ok = status !== null && status >= 200 && status < 300;
  return { ok, status, responseText, error, attempt };
}

/**
 * Deliver a webhook to the configured web app callback URL.
 *
 * The first attempt is awaited so callers can report its outcome. Failed
 * deliveries are retried in the background (via executionCtx.waitUntil when
 * available) with increasing delays.
 */
export async function deliverWebhook(dbClient, env, payload, { executionCtx = null, callbackUrl = null } = {}) {
  const url = callbackUrl || (await dbClient.getConfig('webapp_callback_url', ''));
  if (!url) {
    return { delivered: false, skipped: true, detail: 'WebApp Callback URL is not configured in settings.' };
  }

  const secret = await getWebhookSecret(dbClient, env);
  if (!secret) {
    console.warn('Webhook signing secret is not configured; delivering unsigned webhook. Generate one in Admin Security.');
  }

  const rawBody = JSON.stringify(payload);
  const first = await attemptDelivery(dbClient, url, payload, rawBody, secret, 1);

  if (first.ok) {
    return {
      delivered: true,
      status: first.status,
      signed: !!secret,
      event_id: payload.event_id,
      detail: `Callback delivered to ${url} (HTTP ${first.status})`,
    };
  }

  const retryTask = (async () => {
    for (let i = 0; i < RETRY_DELAYS_MS.length; i++) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[i]));
      const result = await attemptDelivery(dbClient, url, payload, rawBody, secret, i + 2);
      if (result.ok) {
        console.log(`Webhook ${payload.event_id} delivered on attempt ${i + 2}`);
        return;
      }
    }
    console.error(`Webhook ${payload.event_id} failed after ${RETRY_DELAYS_MS.length + 1} attempts`);
  })();

  let retryScheduled = false;
  try {
    if (executionCtx && typeof executionCtx.waitUntil === 'function') {
      executionCtx.waitUntil(retryTask);
      retryScheduled = true;
    }
  } catch (e) {
    // executionCtx not available in this environment; retries are dropped.
  }

  return {
    delivered: false,
    status: first.status,
    signed: !!secret,
    event_id: payload.event_id,
    retry_scheduled: retryScheduled,
    detail: first.error
      ? `Failed to deliver callback: ${first.error}${retryScheduled ? ' (retrying in background)' : ''}`
      : `Callback delivered to ${url} but returned HTTP ${first.status}${retryScheduled ? ' (retrying in background)' : ''}`,
  };
}

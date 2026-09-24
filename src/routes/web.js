import { Hono } from 'hono';
import { DbClient } from '../db/client.js';
import { renderConfigView } from '../views/configView.js';
import { renderEmulatorView } from '../views/emulatorView.js';
import { renderSelcomPayView } from '../views/selcomPayView.js';
import { PaymentProcessorManager } from '../gateways/PaymentProcessorManager.js';

export const webRoutes = new Hono();
const manager = new PaymentProcessorManager();

// GET / (Admin Settings & Logs Dashboard)
webRoutes.get('/', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const configs = await dbClient.getAllConfigs();

  const search = c.req.query('search') || '';
  const gateway = c.req.query('gateway') || 'all';
  const status = c.req.query('status') || 'all';
  const page = parseInt(c.req.query('page') || '1', 10);

  const logsData = await dbClient.getPaymentLogs({ search, gateway, status, page, perPage: 10 });

  return c.html(renderConfigView(configs, logsData, null, { search, gateway, status }));
});

// POST /config/save
webRoutes.post('/config/save', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  let body = {};
  const isJsonReq = c.req.header('accept')?.includes('json') || c.req.header('content-type')?.includes('json');

  if (isJsonReq) {
    try { body = await c.req.json(); } catch (e) { body = await c.req.parseBody(); }
  } else {
    body = await c.req.parseBody();
  }

  const keys = [
    'environment_mode',
    'active_gateway',
    'webapp_callback_url',
    // Legacy
    'selcom_base_url',
    'selcom_api_key',
    'selcom_secret_key',
    'selcom_vendor',
    'azampay_base_url',
    'azampay_auth_base_url',
    'azampay_client_id',
    'azampay_client_secret',
    'azampay_app_name',
    'azampay_api_key',
    // Live
    'live_selcom_base_url',
    'live_selcom_api_key',
    'live_selcom_secret_key',
    'live_selcom_vendor',
    'live_azampay_base_url',
    'live_azampay_auth_base_url',
    'live_azampay_client_id',
    'live_azampay_client_secret',
    'live_azampay_app_name',
    'live_azampay_api_key',
    // Sandbox
    'sandbox_selcom_base_url',
    'sandbox_selcom_api_key',
    'sandbox_selcom_secret_key',
    'sandbox_selcom_vendor',
    'sandbox_azampay_base_url',
    'sandbox_azampay_auth_base_url',
    'sandbox_azampay_client_id',
    'sandbox_azampay_client_secret',
    'sandbox_azampay_app_name',
    'sandbox_azampay_api_key',
  ];

  for (const k of keys) {
    if (body[k] !== undefined) {
      await dbClient.setConfig(k, String(body[k]));
    }
  }

  // Test Gateway Connection button clicked?
  if (body.test_gateway) {
    return handleConnectionTest(c, dbClient, body.test_gateway, body);
  }

  const configs = await dbClient.getAllConfigs();

  if (isJsonReq) {
    return c.json({
      success: true,
      message: 'Configurations saved successfully! Live and Sandbox credentials updated independently.',
      configs,
    });
  }

  const logsData = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
  const flash = { type: 'success', text: 'Configurations saved successfully! Live and Sandbox credentials updated independently.' };

  return c.html(renderConfigView(configs, logsData, flash));
});

// Helper: Gateway connection test handler
async function handleConnectionTest(c, dbClient, gatewayToTest, formData) {
  const isJsonReq = c.req.header('accept')?.includes('json') || c.req.header('content-type')?.includes('json');
  const isSelcom = gatewayToTest.includes('selcom');
  const isAzam = gatewayToTest.includes('azampay');
  const isLive = gatewayToTest.startsWith('live_');
  const envLabel = isLive ? 'Live Production' : 'Sandbox / Testing';

  const returnResult = async (success, message) => {
    if (isJsonReq) {
      return c.json({ success, message, type: success ? 'success' : 'error' });
    }
    const configs = await dbClient.getAllConfigs();
    const logsData = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
    return c.html(
      renderConfigView(configs, logsData, {
        type: success ? 'success' : 'error',
        text: message,
      })
    );
  };

  if (isSelcom) {
    const prefix = isLive ? 'live_selcom_' : gatewayToTest.startsWith('sandbox_') ? 'sandbox_selcom_' : 'selcom_';
    const baseUrl = (formData[`${prefix}base_url`] || formData.selcom_base_url || '').replace(/\/+$/, '');
    const apiKey = formData[`${prefix}api_key`] || formData.selcom_api_key || '';
    const secretKey = formData[`${prefix}secret_key`] || formData.selcom_secret_key || '';
    const vendor = formData[`${prefix}vendor`] || formData.selcom_vendor || 'TILL123';

    if (!baseUrl || !apiKey || !secretKey) {
      return returnResult(false, `Selcom ${envLabel} Base URL, API Key, and Secret Key are required to run the connection test.`);
    }

    try {
      const selcom = await manager.getGateway(dbClient, 'selcom');
      const testData = { vendor, order_id: `TEST-${Date.now()}` };
      const headers = selcom.computeHeaders(testData, apiKey, secretKey);

      const res = await fetch(`${baseUrl}/checkout/create-order-minimal`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testData),
      });

      const resJson = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 403) {
        return returnResult(false, `Connection successful, but ${envLabel} credentials were rejected by Selcom (HTTP ${res.status}).`);
      }

      const msg = resJson?.message || `Status Code ${res.status}`;
      return returnResult(true, `Selcom (${envLabel}) API contacted successfully! Gateway responded: ${msg}`);
    } catch (e) {
      return returnResult(false, `Network connection to Selcom (${envLabel}) failed: ${e.message}`);
    }
  }

  if (isAzam) {
    const prefix = isLive ? 'live_azampay_' : gatewayToTest.startsWith('sandbox_') ? 'sandbox_azampay_' : 'azampay_';
    const authBaseUrl = (formData[`${prefix}auth_base_url`] || formData.azampay_auth_base_url || '')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/AppRegistration\/GenerateToken\/?$/i, '');
    const clientId = (formData[`${prefix}client_id`] || formData.azampay_client_id || '').trim();
    const clientSecret = (formData[`${prefix}client_secret`] || formData.azampay_client_secret || '').trim();
    const appName = (formData[`${prefix}app_name`] || formData.azampay_app_name || '').trim();

    if (!authBaseUrl || !clientId || !clientSecret || !appName) {
      return returnResult(false, `AzamPay (${envLabel}) Auth URL, App Name, Client ID, and Client Secret are required.`);
    }

    try {
      const res = await fetch(`${authBaseUrl}/AppRegistration/GenerateToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ appName, clientId, clientSecret }),
      });

      const json = await res.json().catch(() => null);
      const token =
        json?.token || json?.data?.accessToken || json?.data?.token || json?.accessToken;

      if (res.ok && (token || json?.success === true)) {
        return returnResult(true, `AzamPay (${envLabel}) connection test successful! Access token generated successfully.`);
      }

      const errDetail = json?.message || (res.status === 401 ? `Authentication failed (HTTP 401). Verify credentials in ${envLabel} panel.` : `Authentication failed (HTTP ${res.status})`);
      return returnResult(false, `AzamPay (${envLabel}) auth endpoint reached, but token generation failed: ${errDetail}`);
    } catch (e) {
      return returnResult(false, `Network connection to AzamPay (${envLabel}) failed: ${e.message}`);
    }
  }

  return returnResult(false, 'Unsupported gateway test requested.');
}

// Log Management Endpoints
webRoutes.get('/logs/:id', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param('id'), 10);
  const log = await dbClient.findPaymentLogById(id);
  if (!log) return c.json({ error: 'Log not found' }, 404);
  return c.json(log);
});

webRoutes.delete('/logs/:id', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param('id'), 10);
  await dbClient.deletePaymentLog(id);
  return c.json({ success: true, message: 'Transaction log deleted successfully.' });
});

webRoutes.post('/logs/bulk-delete', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const count = await dbClient.bulkDeletePaymentLogs({ type: body.type, ids: body.ids });
  return c.json({ success: true, count, message: `${count} transaction log(s) deleted successfully.` });
});

webRoutes.post('/logs/retry/:id', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param('id'), 10);
  const log = await dbClient.findPaymentLogById(id);
  if (!log) return c.json({ success: false, message: 'Log not found' }, 404);

  let gateway;
  try {
    gateway = await manager.getGateway(dbClient, log.gateway);
  } catch (e) {
    return c.json({ success: false, message: e.message }, 400);
  }

  const rawReq = log.raw_request || {};
  const originUrl = new URL(c.req.url).origin;

  const result = await gateway.initiatePayment(
    dbClient,
    {
      amount: rawReq.amount || log.amount,
      phone: rawReq.phone || log.phone,
      email: rawReq.email || null,
      name: rawReq.name || null,
      external_reference: rawReq.external_reference || log.external_reference,
      remarks: rawReq.remarks || 'Retry transaction',
    },
    originUrl
  );

  await dbClient.updatePaymentLog(log.id, {
    gateway_reference: result.gateway_reference || log.gateway_reference,
    status: result.success ? 'pending' : 'failed',
    raw_response: result.raw_response || null,
  });

  const updatedLog = await dbClient.findPaymentLogById(id);

  if (result.success) {
    return c.json({
      success: true,
      message: 'Transaction retried successfully! Gateway status set to pending.',
      log: updatedLog,
    });
  }

  return c.json(
    {
      success: false,
      message: result.error || 'Gateway initiation failed during retry.',
      log: updatedLog,
    },
    502
  );
});

webRoutes.post('/logs/bulk-retry', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));

  const failedLogs = await dbClient.getAllPaymentLogsFiltered({ status: 'failed' });

  let retriedCount = 0;
  let succeededCount = 0;
  let failedCount = 0;

  const originUrl = new URL(c.req.url).origin;

  for (const log of failedLogs) {
    retriedCount++;
    try {
      const gateway = await manager.getGateway(dbClient, log.gateway);
      const rawReq = log.raw_request || {};

      const result = await gateway.initiatePayment(
        dbClient,
        {
          amount: rawReq.amount || log.amount,
          phone: rawReq.phone || log.phone,
          email: rawReq.email || null,
          name: rawReq.name || null,
          external_reference: rawReq.external_reference || log.external_reference,
          remarks: rawReq.remarks || 'Bulk retry transaction',
        },
        originUrl
      );

      await dbClient.updatePaymentLog(log.id, {
        gateway_reference: result.gateway_reference || log.gateway_reference,
        status: result.success ? 'pending' : 'failed',
        raw_response: result.raw_response || null,
      });

      if (result.success) {
        succeededCount++;
      } else {
        failedCount++;
      }
    } catch (e) {
      failedCount++;
    }
  }

  return c.json({
    success: true,
    retried_count: retriedCount,
    succeeded_count: succeededCount,
    failed_count: failedCount,
    message: `Bulk retry completed. ${succeededCount} succeeded, ${failedCount} failed out of ${retriedCount} attempt(s).`,
  });
});

// CSV & JSON Log Exporter
webRoutes.get('/logs/export', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const search = c.req.query('search') || '';
  const gateway = c.req.query('gateway') || 'all';
  const status = c.req.query('status') || 'all';
  const format = (c.req.query('format') || 'csv').toLowerCase();

  const logs = await dbClient.getAllPaymentLogsFiltered({ search, gateway, status });
  const filenameDate = new Date().toISOString().replace(/[:\.-]/g, '');

  if (format === 'json') {
    return c.text(JSON.stringify(logs, null, 2), 200, {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="transaction_logs_${filenameDate}.json"`,
    });
  }

  // CSV format
  const rows = [
    ['ID', 'Date', 'External Reference', 'Gateway Reference', 'Gateway', 'Phone', 'Amount (TZS)', 'Status'],
  ];

  for (const log of logs) {
    rows.push([
      log.id,
      log.created_at || '',
      `"${String(log.external_reference || '').replace(/"/g, '""')}"`,
      `"${String(log.gateway_reference || '').replace(/"/g, '""')}"`,
      String(log.gateway || '').toUpperCase(),
      `"${String(log.phone || '').replace(/"/g, '""')}"`,
      log.amount,
      log.status,
    ]);
  }

  const csvContent = rows.map((r) => r.join(',')).join('\n');

  return c.text(csvContent, 200, {
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="transaction_logs_${filenameDate}.csv"`,
  });
});

// Request Log Management Endpoints (Everything Coming & Leaving)
webRoutes.get('/requests', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const search = c.req.query('search') || '';
  const direction = c.req.query('direction') || '';
  const status = c.req.query('status') || '';
  const method = c.req.query('method') || '';
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = parseInt(c.req.query('per_page') || '15', 10);

  const logs = await dbClient.getRequestLogs({ search, direction, status, method, page, perPage });
  return c.json(logs);
});

webRoutes.get('/requests/:id', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param('id'), 10);
  const log = await dbClient.findRequestLogById(id);
  if (!log) return c.json({ error: 'Request log not found' }, 404);
  return c.json(log);
});

webRoutes.delete('/requests/:id', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const id = parseInt(c.req.param('id'), 10);
  await dbClient.deleteRequestLog(id);
  return c.json({ success: true, message: 'Request log deleted successfully.' });
});

webRoutes.post('/requests/bulk-delete', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const count = await dbClient.bulkDeleteRequestLogs({ type: body.type, ids: body.ids });
  return c.json({ success: true, count, message: `${count} request log(s) deleted successfully.` });
});

// Interactive Status Check Route for Admin UI
webRoutes.post('/check-status-interactive', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const ref = body.external_reference;

  if (!ref) {
    return c.json({ success: false, message: 'external_reference is required.' }, 400);
  }

  const traceSteps = [];

  // Step 1: Query Local DB
  traceSteps.push({ step: 1, name: 'Database Lookup', detail: `Querying payment_logs for external_reference: "${ref}"` });
  let log = await dbClient.findPaymentLogByRef(ref);

  if (!log) {
    traceSteps.push({ step: 2, name: 'Lookup Failed', detail: 'No payment record found with this reference in local DB.' });
    return c.json({
      success: false,
      message: 'Payment log not found',
      external_reference: ref,
      trace: traceSteps,
    });
  }

  traceSteps.push({
    step: 2,
    name: 'DB Record Found',
    detail: `Gateway: ${log.gateway.toUpperCase()}, Current DB Status: ${log.status.toUpperCase()}, Amount: TZS ${log.amount}`,
  });

  if (log.status !== 'pending') {
    traceSteps.push({
      step: 3,
      name: 'Status Already Finalized',
      detail: `Payment is already finalized as "${log.status}". No external gateway poll required.`,
    });
    return c.json({
      success: true,
      external_reference: log.external_reference,
      status: log.status,
      amount: log.amount,
      gateway: log.gateway,
      gateway_reference: log.gateway_reference,
      checked_remote: false,
      message: log.status === 'success' ? 'Payment completed successfully' : 'Payment failed',
      trace: traceSteps,
    });
  }

  // Step 3: Check Remote Gateway (AzamPay / Selcom)
  traceSteps.push({
    step: 3,
    name: 'Initiating Direct Gateway Status Check',
    detail: `Status is PENDING. Contacting ${log.gateway.toUpperCase()} API to verify live payment status...`,
  });

  const { performStatusCheck } = await import('./api.js');
  const statusRes = await performStatusCheck(dbClient, ref);

  if (statusRes.payload.checked_remote) {
    traceSteps.push({
      step: 4,
      name: 'Gateway Response Received',
      detail: `Remote gateway check completed. Updated Status: ${statusRes.payload.status.toUpperCase()}. Detail: ${statusRes.payload.remote_detail || 'N/A'}`,
    });
  } else {
    traceSteps.push({
      step: 4,
      name: 'Gateway Check Skipped',
      detail: 'Gateway driver did not execute remote status query.',
    });
  }

  traceSteps.push({
    step: 5,
    name: 'Final Response Ready',
    detail: `Returning status update to Web Application. Final status: ${statusRes.payload.status.toUpperCase()}`,
  });

  return c.json({
    ...statusRes.payload,
    trace: traceSteps,
  });
});

// Emulator Routes
webRoutes.get('/emulator', (c) => {
  return c.html(renderEmulatorView());
});

webRoutes.get('/emulator/selcom-pay/:orderId', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const orderId = c.req.param('orderId');
  const transaction = await dbClient.findEmulatorTxnByExtId(orderId, 'selcom');
  return c.html(renderSelcomPayView(transaction, orderId));
});

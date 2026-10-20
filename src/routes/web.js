import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { DbClient } from '../db/client.js';
import { renderConfigView } from '../views/configView.js';
import { renderEmulatorView } from '../views/emulatorView.js';
import { renderSelcomPayView } from '../views/selcomPayView.js';
import { renderLoginView } from '../views/loginView.js';
import { PaymentProcessorManager } from '../gateways/PaymentProcessorManager.js';
import {
  dashboardAuthMiddleware,
  getAdminCredentials,
  verifyPassword,
  updateAdminCredentials,
  createSessionToken,
  setDashboardSessionCookie,
  clearDashboardSessionCookie,
  SESSION_COOKIE_NAME,
  verifySessionToken,
  MIN_PASSWORD_LENGTH,
} from '../utils/auth.js';
import { rotateApiKey, revokeApiKeys, rotateWebhookSecret, CONFIG_KEYS } from '../utils/apiAuth.js';
import { rateLimit, clientIp, validateWebhookUrl } from '../utils/security.js';

export const webRoutes = new Hono();
const manager = new PaymentProcessorManager();

/**
 * Only allow redirects to local paths (prevents open redirect after login).
 */
function safeRedirectPath(value) {
  const v = String(value || '/');
  if (!v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\')) return '/';
  return v;
}

/**
 * Non-secret view of the web app integration credentials for the dashboard.
 */
async function getIntegrationSettings(dbClient, env = {}) {
  return {
    apiKeyPrefix: await dbClient.getConfig(CONFIG_KEYS.apiKeyPrefix, ''),
    apiKeyCreatedAt: await dbClient.getConfig(CONFIG_KEYS.apiKeyCreatedAt, ''),
    apiKeyFromEnv: !!env.WEBAPP_API_KEY,
    previousKeyExpiresAt: await dbClient.getConfig(CONFIG_KEYS.previousApiKeyExpiresAt, ''),
    webhookSecretPrefix: await dbClient.getConfig(CONFIG_KEYS.webhookSecretPrefix, ''),
    webhookSecretCreatedAt: await dbClient.getConfig(CONFIG_KEYS.webhookSecretCreatedAt, ''),
    webhookSecretFromEnv: !!env.WEBAPP_WEBHOOK_SECRET,
    requireSignedRequests: (await dbClient.getConfig(CONFIG_KEYS.requireSignedRequests, '0')) === '1',
    allowedOrigins: await dbClient.getConfig(CONFIG_KEYS.allowedOrigins, ''),
  };
}

// Apply Authentication Middleware to all Dashboard Web Routes
webRoutes.use('*', dashboardAuthMiddleware);

// GET /login (Render Login Page)
webRoutes.get('/login', async (c) => {
  const redirect = safeRedirectPath(c.req.query('redirect'));
  const dbClient = new DbClient(c.env.DB);
  const creds = await getAdminCredentials(dbClient, c.env, c);
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (await verifySessionToken(token, creds)) {
    return c.redirect(redirect, 302);
  }

  if (creds.loginDisabled) {
    return c.html(
      renderLoginView({
        redirect,
        error:
          'Dashboard login is locked: no administrator password is configured. Set the ADMIN_PASSWORD Worker secret (wrangler secret put ADMIN_PASSWORD) and reload.',
      }),
      503
    );
  }

  return c.html(renderLoginView({ redirect }));
});

// POST /login (Submit Login Credentials)
webRoutes.post('/login', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.parseBody();
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const redirect = safeRedirectPath(body.redirect);

  const ip = clientIp(c);
  const allowed = await rateLimit(c.env, { binding: 'LOGIN_RATE_LIMITER', key: `login:${ip}`, limit: 10, periodSec: 60 });
  if (!allowed) {
    return c.html(
      renderLoginView({ error: 'Too many login attempts. Please wait a minute and try again.', redirect, username }),
      429
    );
  }

  let creds = await getAdminCredentials(dbClient, c.env, c);

  if (creds.loginDisabled) {
    return c.html(
      renderLoginView({
        error: 'Dashboard login is locked: no administrator password is configured. Set the ADMIN_PASSWORD Worker secret.',
        redirect,
      }),
      503
    );
  }

  if (username === creds.username && (await verifyPassword(password, creds))) {
    // Transparently upgrade legacy SHA-256 hashes to PBKDF2 on successful login
    if (creds.needsUpgrade) {
      await updateAdminCredentials(dbClient, creds.username, password);
      creds = await getAdminCredentials(dbClient, c.env, c);
    }
    const token = await createSessionToken(creds.username, creds);
    setDashboardSessionCookie(c, token);
    return c.redirect(redirect, 302);
  }
  console.warn(`[AUDIT] Failed dashboard login for "${username}" from ${ip}`);

  return c.html(
    renderLoginView({
      error: 'Invalid admin username or password. Please try again.',
      redirect,
      username,
    }),
    401
  );
});

// GET /logout (Clear Session & Redirect to Login)
webRoutes.get('/logout', (c) => {
  clearDashboardSessionCookie(c);
  return c.redirect('/login?logout=1', 302);
});

// GET / (Admin Settings & Logs Dashboard)
webRoutes.get('/', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const configs = await dbClient.getAllConfigs();
  const adminCreds = await getAdminCredentials(dbClient, c.env, c);

  const search = c.req.query('search') || '';
  const gateway = c.req.query('gateway') || 'all';
  const status = c.req.query('status') || 'all';
  const page = parseInt(c.req.query('page') || '1', 10);

  const logsData = await dbClient.getPaymentLogs({ search, gateway, status, page, perPage: 10 });
  const integration = await getIntegrationSettings(dbClient, c.env);

  return c.html(renderConfigView(configs, logsData, null, { search, gateway, status }, adminCreds, integration));
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
    'pending_timeout_minutes',
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
    'live_azampay_callback_user',
    'live_azampay_callback_password',
    'live_azampay_require_signed_callbacks',
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
    'sandbox_azampay_callback_user',
    'sandbox_azampay_callback_password',
    'sandbox_azampay_require_signed_callbacks',
  ];

  for (const flag of ['live_azampay_require_signed_callbacks', 'sandbox_azampay_require_signed_callbacks']) {
    if (body[flag] !== undefined) {
      body[flag] = ['1', 'true', 'yes', 'on'].includes(String(body[flag]).toLowerCase()) ? '1' : '0';
    }
  }

  if (body.pending_timeout_minutes !== undefined) {
    const n = parseInt(String(body.pending_timeout_minutes).trim(), 10);
    if (!Number.isFinite(n) || n < 0 || n > 10080) {
      const msg = 'Pending timeout must be a whole number of minutes between 0 and 10080 (0 disables expiry).';
      if (isJsonReq) return c.json({ success: false, message: msg }, 400);
      const configs = await dbClient.getAllConfigs();
      const logsData = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      const adminCreds = await getAdminCredentials(dbClient, c.env, c);
      const integration = await getIntegrationSettings(dbClient, c.env);
      return c.html(renderConfigView(configs, logsData, { type: 'error', text: msg }, {}, adminCreds, integration), 400);
    }
    body.pending_timeout_minutes = String(n);
  }

  if (body.webapp_callback_url !== undefined) {
    const check = validateWebhookUrl(body.webapp_callback_url);
    if (!check.ok) {
      if (isJsonReq) return c.json({ success: false, message: check.error }, 400);
      const configs = await dbClient.getAllConfigs();
      const logsData = await dbClient.getPaymentLogs({ page: 1, perPage: 10 });
      const adminCreds = await getAdminCredentials(dbClient, c.env, c);
      const integration = await getIntegrationSettings(dbClient, c.env);
      return c.html(renderConfigView(configs, logsData, { type: 'error', text: check.error }, {}, adminCreds, integration), 400);
    }
    body.webapp_callback_url = check.url;
  }

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
  const adminCreds = await getAdminCredentials(dbClient, c.env, c);
  const integration = await getIntegrationSettings(dbClient, c.env);
  const flash = { type: 'success', text: 'Configurations saved successfully! Live and Sandbox credentials updated independently.' };

  return c.html(renderConfigView(configs, logsData, flash, {}, adminCreds, integration));
});

// POST /config/save-security
webRoutes.post('/config/save-security', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const currentPassword = String(body.current_password || '');
  const newUsername = String(body.admin_username || '').trim();
  const newPassword = String(body.new_password || '');
  const confirmPassword = String(body.confirm_password || '');

  const creds = await getAdminCredentials(dbClient, c.env, c);

  // Verify current password
  if (!(await verifyPassword(currentPassword, creds))) {
    return c.json({ success: false, message: 'Current password verification failed. Invalid password.' }, 400);
  }

  if (newPassword) {
    if (newPassword !== confirmPassword) {
      return c.json({ success: false, message: 'New password and confirmation password do not match.' }, 400);
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return c.json({ success: false, message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.` }, 400);
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return c.json({ success: false, message: 'New password must contain both letters and numbers.' }, 400);
    }
  }

  const targetUsername = newUsername || creds.username;
  const passwordToSet = newPassword || currentPassword;

  await updateAdminCredentials(dbClient, targetUsername, passwordToSet);

  // Re-issue session cookie with updated credentials
  const updatedCreds = await getAdminCredentials(dbClient, c.env, c);
  const newToken = await createSessionToken(updatedCreds.username, updatedCreds);
  setDashboardSessionCookie(c, newToken);

  return c.json({
    success: true,
    message: 'Admin security credentials updated successfully!',
  });
});

// ---------------------------------------------------------------------------
// Web App Integration credentials (API key, webhook secret, CORS, signing policy)
// Sensitive operations re-verify the admin password.
// ---------------------------------------------------------------------------
async function reauth(c, dbClient, body) {
  const creds = await getAdminCredentials(dbClient, c.env, c);
  const ok = await verifyPassword(String(body.current_password || ''), creds);
  if (!ok) {
    return c.json({ success: false, message: 'Current password verification failed. Invalid password.' }, 400);
  }
  return null;
}

webRoutes.post('/config/api-key/rotate', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const denied = await reauth(c, dbClient, body);
  if (denied) return denied;

  const result = await rotateApiKey(dbClient);
  console.warn(`[AUDIT] Admin "${c.get('adminUser')}" rotated the web app API key from ${clientIp(c)}`);
  return c.json({
    success: true,
    api_key: result.key,
    prefix: result.prefix,
    created_at: result.createdAt,
    message: 'New API key generated. Copy it now; it will not be shown again. The previous key keeps working for 24 hours.',
  });
});

webRoutes.post('/config/api-key/revoke', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const denied = await reauth(c, dbClient, body);
  if (denied) return denied;

  await revokeApiKeys(dbClient);
  console.warn(`[AUDIT] Admin "${c.get('adminUser')}" revoked all web app API keys from ${clientIp(c)}`);
  return c.json({ success: true, message: 'All dashboard-issued API keys revoked. The web app API is now locked until a new key is generated.' });
});

webRoutes.post('/config/webhook-secret/rotate', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const denied = await reauth(c, dbClient, body);
  if (denied) return denied;

  const result = await rotateWebhookSecret(dbClient);
  console.warn(`[AUDIT] Admin "${c.get('adminUser')}" rotated the webhook signing secret from ${clientIp(c)}`);
  return c.json({
    success: true,
    webhook_secret: result.secret,
    prefix: result.prefix,
    created_at: result.createdAt,
    message: 'New webhook signing secret generated. Copy it into your web app now; it will not be shown again.',
  });
});

webRoutes.post('/config/integration', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));

  if (body.allowed_origins !== undefined) {
    const origins = String(body.allowed_origins || '')
      .split(/[,\s]+/)
      .map((o) => o.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    for (const o of origins) {
      let parsed;
      try { parsed = new URL(o); } catch (e) { parsed = null; }
      if (!parsed || parsed.origin !== o || !['http:', 'https:'].includes(parsed.protocol)) {
        return c.json({ success: false, message: `"${o}" is not a valid origin. Use the form https://app.example.com with no path.` }, 400);
      }
    }
    await dbClient.setConfig(CONFIG_KEYS.allowedOrigins, origins.join(','));
  }

  if (body.require_signed_requests !== undefined) {
    await dbClient.setConfig(CONFIG_KEYS.requireSignedRequests, body.require_signed_requests ? '1' : '0');
  }

  return c.json({ success: true, message: 'Integration settings saved.', integration: await getIntegrationSettings(dbClient, c.env) });
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
    const adminCreds = await getAdminCredentials(dbClient, c.env, c);
    const integration = await getIntegrationSettings(dbClient, c.env);
    return c.html(
      renderConfigView(configs, logsData, {
        type: success ? 'success' : 'error',
        text: message,
      }, {}, adminCreds, integration)
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
// Fetch (or refresh) AzamPay's callback-signing public key for the chosen environment
webRoutes.post('/config/azampay/refresh-public-key', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const env = body.environment === 'sandbox' ? 'sandbox' : body.environment === 'live' ? 'live' : null;
  const targetEnv = env || (await dbClient.getConfig('environment_mode', 'sandbox'));

  const gateway = await new PaymentProcessorManager().getGateway(dbClient, 'azampay');
  const pem = await gateway.fetchCallbackPublicKey(dbClient, targetEnv);
  if (!pem) {
    return c.json({ success: false, message: `Could not fetch the AzamPay public key for the ${targetEnv} environment. Check the base URL and credentials, then see the Request Inspector for the response.` }, 502);
  }
  return c.json({
    success: true,
    environment: targetEnv,
    fetched_at: await dbClient.getConfig(`${targetEnv}_azampay_public_key_fetched_at`, ''),
    public_key: pem,
    message: `AzamPay ${targetEnv} public key fetched and cached. Signed callbacks will now be verified with it.`,
  });
});

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
  const statusRes = await performStatusCheck(dbClient, ref, c.env, c.executionCtx);

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
  const adminUser = c.get('adminUser') || 'admin';
  return c.html(renderEmulatorView(adminUser));
});

webRoutes.get('/emulator/selcom-pay/:orderId', async (c) => {
  const dbClient = new DbClient(c.env.DB);
  const orderId = c.req.param('orderId');
  const transaction = await dbClient.findEmulatorTxnByExtId(orderId, 'selcom');
  return c.html(renderSelcomPayView(transaction, orderId));
});

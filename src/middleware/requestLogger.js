import { DbClient } from '../db/client.js';
import { redactBodyText } from '../utils/security.js';

// Paths whose bodies are never stored (credentials / secrets in transit)
const FULLY_REDACTED_PATHS = ['/login', '/config/save', '/config/save-security', '/config/integration'];
const REDACTED_HEADERS = ['authorization', 'x-api-key', 'cookie', 'x-pp-signature', 'x-signature', 'digest'];

export async function requestLoggerMiddleware(c, next) {
  // Skip logging internal static assets or simple polling noise if needed
  const path = c.req.path;
  const isApi = path.startsWith('/api');
  const isAction = path.startsWith('/config') || path.startsWith('/logs') || path.startsWith('/requests');
  
  // If not API or action and simple GET to dashboard static assets, still log or pass
  const startTime = Date.now();
  const requestId = `in_${startTime}_${Math.random().toString(36).substring(2, 7)}`;

  // Capture request body safely
  let reqBodyText = null;
  let externalRef = null;

  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    try {
      // Clone request to avoid consuming stream
      const reqClone = c.req.raw.clone();
      reqBodyText = await reqClone.text();
      
      try {
        const parsedJson = JSON.parse(reqBodyText);
        externalRef = parsedJson.external_reference || parsedJson.external_id || parsedJson.order_id || parsedJson.utilityref;
      } catch (e) {
        // Not JSON
      }
    } catch (e) {
      reqBodyText = null;
    }
  }

  // Also check query param or path param for external_reference
  if (!externalRef) {
    externalRef = c.req.query('external_reference') || c.req.query('order_id') || c.req.param('external_reference');
  }

  // Sanitize headers
  const reqHeaders = {};
  c.req.raw.headers.forEach((value, key) => {
    if (REDACTED_HEADERS.includes(key.toLowerCase())) {
      reqHeaders[key] = '[REDACTED]';
    } else {
      reqHeaders[key] = value;
    }
  });

  // Sanitize request body
  if (reqBodyText) {
    if (FULLY_REDACTED_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
      reqBodyText = '[REDACTED: credentials or secrets submitted on this route are never stored]';
    } else {
      reqBodyText = redactBodyText(reqBodyText);
    }
  }

  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';

  // Proceed to route handler
  await next();

  const durationMs = Date.now() - startTime;
  const responseStatus = c.res.status;

  // Intercept response body
  let resBodyText = null;
  try {
    const resType = c.res.headers.get('content-type') || '';
    if (resType.includes('text/html')) {
      resBodyText = '[HTML response omitted]';
    } else {
      const resClone = c.res.clone();
      resBodyText = redactBodyText(await resClone.text());
    }
  } catch (e) {
    resBodyText = null;
  }

  // Asynchronously record request log in DB if DB binding is available
  if (c.env && c.env.DB) {
    try {
      c.executionCtx.waitUntil(saveLog());
    } catch (e) {
      saveLog();
    }
  }

  async function saveLog() {
    try {
      const dbClient = new DbClient(c.env.DB);
      await dbClient.createRequestLog({
        request_id: requestId,
        direction: 'INBOUND',
        method: c.req.method,
        path: c.req.url,
        status_code: responseStatus,
        headers: reqHeaders,
        request_body: reqBodyText,
        response_body: resBodyText,
        ip_address: ipAddress,
        duration_ms: durationMs,
        external_reference: externalRef,
      });
    } catch (err) {
      console.error('Failed to log inbound request:', err);
    }
  }
}

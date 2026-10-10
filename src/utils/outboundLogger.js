/**
 * Helper to log outbound HTTP requests made by the processor to external services (AzamPay, Selcom, WebApp callbacks)
 */

import { redactSensitive, redactBodyText } from './security.js';

export async function logOutboundRequest(dbClient, {
  method = 'POST',
  url = '',
  headers = {},
  requestBody = null,
  responseStatus = null,
  responseBody = null,
  durationMs = 0,
  externalReference = null,
  gateway = null,
}) {
  if (!dbClient) return;

  try {
    // Sanitize sensitive headers and bodies before saving (client secrets, tokens, digests)
    const sanitizedHeaders = redactSensitive({ ...headers });
    const sanitizedRequestBody =
      typeof requestBody === 'string' ? redactBodyText(requestBody) : redactSensitive(requestBody);
    const sanitizedResponseBody =
      typeof responseBody === 'string' ? redactBodyText(responseBody) : redactSensitive(responseBody);

    const requestId = `out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await dbClient.createRequestLog({
      request_id: requestId,
      direction: 'OUTBOUND',
      method: method.toUpperCase(),
      path: url,
      status_code: responseStatus,
      headers: sanitizedHeaders,
      request_body: sanitizedRequestBody,
      response_body: sanitizedResponseBody,
      ip_address: 'processor-egress',
      duration_ms: durationMs,
      external_reference: externalReference,
      gateway: gateway,
    });
  } catch (e) {
    console.error('Error in logOutboundRequest:', e);
  }
}

/**
 * Helper to log outbound HTTP requests made by the processor to external services (AzamPay, Selcom, WebApp callbacks)
 */

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
    // Sanitize sensitive headers before saving
    const sanitizedHeaders = { ...headers };
    if (sanitizedHeaders.Authorization) {
      sanitizedHeaders.Authorization = sanitizedHeaders.Authorization.substring(0, 15) + '...[REDACTED]';
    }
    if (sanitizedHeaders['X-API-KEY']) {
      sanitizedHeaders['X-API-KEY'] = '[REDACTED]';
    }
    if (sanitizedHeaders['x-api-key']) {
      sanitizedHeaders['x-api-key'] = '[REDACTED]';
    }

    const requestId = `out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await dbClient.createRequestLog({
      request_id: requestId,
      direction: 'OUTBOUND',
      method: method.toUpperCase(),
      path: url,
      status_code: responseStatus,
      headers: sanitizedHeaders,
      request_body: requestBody,
      response_body: responseBody,
      ip_address: 'processor-egress',
      duration_ms: durationMs,
      external_reference: externalReference,
      gateway: gateway,
    });
  } catch (e) {
    console.error('Error in logOutboundRequest:', e);
  }
}

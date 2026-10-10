import { hmacSha256, safeEqual } from '../utils/security.js';
import { logOutboundRequest } from '../utils/outboundLogger.js';

export class AzamPayGateway {
  getName() {
    return 'azampay';
  }

  async initiatePayment(dbClient, params, originUrl = '', targetEnv = null) {
    const envMode = targetEnv || params.environment || null;
    const rawBaseUrl = await dbClient.getGatewayConfig('azampay', 'base_url', envMode);
    const rawAuthBaseUrl = await dbClient.getGatewayConfig('azampay', 'auth_base_url', envMode);

    if (!rawAuthBaseUrl || !rawBaseUrl) {
      return {
        success: false,
        error:
          'AzamPay Base URL or Auth Base URL is not configured. Please check your AzamPay configuration panel.',
        raw_response: {
          azampay_base_url: rawBaseUrl,
          azampay_auth_base_url: rawAuthBaseUrl,
        },
      };
    }

    const baseUrl = rawBaseUrl
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/azampay\/mno\/checkout\/?$/i, '');

    const authBaseUrl = rawAuthBaseUrl
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/AppRegistration\/GenerateToken\/?$/i, '');

    const clientId = ((await dbClient.getGatewayConfig('azampay', 'client_id', envMode)) || '').trim();
    const clientSecret = ((await dbClient.getGatewayConfig('azampay', 'client_secret', envMode)) || '').trim();
    const appName = ((await dbClient.getGatewayConfig('azampay', 'app_name', envMode)) || '').trim();
    const apiKey = ((await dbClient.getGatewayConfig('azampay', 'api_key', envMode)) || '').trim();

    const phone = this.formatPhoneNumber(params.phone || '');
    const provider = this.normalizeProvider(params.provider) || this.detectOperator(phone);
    const externalId = params.external_reference || `GTY-1-${Date.now()}`;

    if (!provider) {
      return {
        success: false,
        error: 'Unable to detect mobile operator from phone number prefix',
        raw_response: { phone },
      };
    }

    // 1. Generate token
    let token = null;
    let tokenData = null;
    let rawText = '';
    const tokenStart = Date.now();

    try {
      const tokenReqBody = { appName, clientId, clientSecret };
      const tokenRes = await fetch(`${authBaseUrl}/AppRegistration/GenerateToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(tokenReqBody),
      });

      rawText = await tokenRes.text().catch(() => '');
      try {
        tokenData = JSON.parse(rawText);
      } catch (e) {
        tokenData = null;
      }

      await logOutboundRequest(dbClient, {
        method: 'POST',
        url: `${authBaseUrl}/AppRegistration/GenerateToken`,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        requestBody: tokenReqBody,
        responseStatus: tokenRes.status,
        responseBody: tokenData || rawText,
        durationMs: Date.now() - tokenStart,
        externalReference: externalId,
        gateway: 'azampay',
      });

      if (tokenData) {
        token =
          tokenData.token ||
          tokenData.data?.accessToken ||
          tokenData.data?.token ||
          tokenData.accessToken;
      }

      if (!tokenRes.ok || !token) {
        const errMsg =
          tokenData?.message ||
          (tokenRes.status === 401
            ? `Authentication failed (HTTP 401). Check appName/clientId/clientSecret in your active environment panel.`
            : tokenRes.status === 404
            ? `Auth endpoint not found at ${authBaseUrl}/AppRegistration/GenerateToken`
            : `Authentication endpoint rejected credentials (HTTP ${tokenRes.status})`);

        return {
          success: false,
          error: `Failed to generate AzamPay token: ${errMsg}`,
          raw_response: tokenData || { status: tokenRes.status, body: rawText },
        };
      }
    } catch (e) {
      console.error('AzamPay token generation error:', e);
      return {
        success: false,
        error: `AzamPay token generation failed: ${e.message}`,
        raw_response: { exception: e.message },
      };
    }

    // 2. Perform checkout
    const payload = {
      amount: String(params.amount),
      currency: 'TZS',
      accountNumber: phone,
      externalId,
      provider,
    };

    const checkoutStart = Date.now();
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['X-API-KEY'] = apiKey;
        headers['x-api-key'] = apiKey;
      }

      const checkoutRes = await fetch(`${baseUrl}/azampay/mno/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const checkoutText = await checkoutRes.text().catch(() => '');
      let responseBody = null;
      try {
        responseBody = JSON.parse(checkoutText);
      } catch (e) {
        responseBody = null;
      }

      await logOutboundRequest(dbClient, {
        method: 'POST',
        url: `${baseUrl}/azampay/mno/checkout`,
        headers,
        requestBody: payload,
        responseStatus: checkoutRes.status,
        responseBody: responseBody || checkoutText,
        durationMs: Date.now() - checkoutStart,
        externalReference: externalId,
        gateway: 'azampay',
      });

      if (
        checkoutRes.ok &&
        responseBody &&
        (responseBody.success === true || responseBody.success === 'true')
      ) {
        return {
          success: true,
          gateway_reference: responseBody.transactionId || null,
          payment_url: null,
          raw_response: responseBody,
        };
      }

      let errorMsg = responseBody?.message || `Gateway failed to initiate payment (HTTP ${checkoutRes.status})`;
      if (errorMsg.includes('Invalid Vendor')) {
        errorMsg += ` (Detected operator/vendor '${provider}' may be invalid for phone '${phone}' or not supported on this account).`;
      }

      return {
        success: false,
        error: errorMsg,
        raw_response: responseBody || { status: checkoutRes.status, body: checkoutText },
      };
    } catch (e) {
      console.error('AzamPay initiatePayment error:', e);
      return {
        success: false,
        error: `Connection to AzamPay failed: ${e.message}`,
        raw_response: { exception: e.message },
      };
    }
  }

  async checkTransactionStatus(dbClient, externalReference, gatewayReference = null, targetEnv = null) {
    const rawBaseUrl = await dbClient.getGatewayConfig('azampay', 'base_url', targetEnv);
    const rawAuthBaseUrl = await dbClient.getGatewayConfig('azampay', 'auth_base_url', targetEnv);

    if (!rawAuthBaseUrl || !rawBaseUrl) {
      return {
        success: false,
        status: 'pending',
        error: 'AzamPay Base URL or Auth Base URL is not configured.',
      };
    }

    const baseUrl = rawBaseUrl
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/azampay\/mno\/checkout\/?$/i, '');

    const authBaseUrl = rawAuthBaseUrl
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/AppRegistration\/GenerateToken\/?$/i, '');

    const clientId = ((await dbClient.getGatewayConfig('azampay', 'client_id', targetEnv)) || '').trim();
    const clientSecret = ((await dbClient.getGatewayConfig('azampay', 'client_secret', targetEnv)) || '').trim();
    const appName = ((await dbClient.getGatewayConfig('azampay', 'app_name', targetEnv)) || '').trim();
    const apiKey = ((await dbClient.getGatewayConfig('azampay', 'api_key', targetEnv)) || '').trim();

    // 1. Generate token
    let token = null;
    try {
      const tokenStart = Date.now();
      const tokenBody = { appName, clientId, clientSecret };
      const tokenRes = await fetch(`${authBaseUrl}/AppRegistration/GenerateToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(tokenBody),
        signal: AbortSignal.timeout(4000),
      });

      const tokenText = await tokenRes.text().catch(() => '');
      let tokenData = null;
      try { tokenData = JSON.parse(tokenText); } catch (e) {}

      await logOutboundRequest(dbClient, {
        method: 'POST',
        url: `${authBaseUrl}/AppRegistration/GenerateToken`,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        requestBody: tokenBody,
        responseStatus: tokenRes.status,
        responseBody: tokenData || tokenText,
        durationMs: Date.now() - tokenStart,
        externalReference,
        gateway: 'azampay',
      });

      if (tokenData) {
        token = tokenData.token || tokenData.data?.accessToken || tokenData.data?.token || tokenData.accessToken;
      }
    } catch (e) {
      console.error('AzamPay token error during status check:', e);
    }

    if (!token) {
      return {
        success: false,
        status: 'pending',
        error: 'Failed to authenticate with AzamPay for status check.',
      };
    }

    // 2. Query status using candidates with fast timeouts
    const candidateRequests = [];
    if (gatewayReference) {
      candidateRequests.push({
        url: `${baseUrl}/azampay/mno/checkout/status?transactionId=${encodeURIComponent(gatewayReference)}`,
        method: 'GET',
        body: null,
      });
    }
    if (externalReference) {
      candidateRequests.push({
        url: `${baseUrl}/azampay/mno/checkout/status?externalId=${encodeURIComponent(externalReference)}`,
        method: 'GET',
        body: null,
      });
      candidateRequests.push({
        url: `${baseUrl}/statuscheck`,
        method: 'POST',
        body: JSON.stringify({ MerchantReferenceId: externalReference }),
      });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['x-api-key'] = apiKey;
    }

    let lastRes = null;
    let lastResText = '';
    let lastData = null;

    for (const req of candidateRequests) {
      const start = Date.now();
      try {
        const fetchOptions = {
          method: req.method,
          headers,
          signal: AbortSignal.timeout(3500),
        };
        if (req.body) fetchOptions.body = req.body;

        const res = await fetch(req.url, fetchOptions);
        const resText = await res.text().catch(() => '');
        let data = null;
        try { data = JSON.parse(resText); } catch (e) {}

        await logOutboundRequest(dbClient, {
          method: req.method,
          url: req.url,
          headers,
          requestBody: req.body ? JSON.parse(req.body) : null,
          responseStatus: res.status,
          responseBody: data || resText,
          durationMs: Date.now() - start,
          externalReference,
          gateway: 'azampay',
        });

        lastRes = res;
        lastResText = resText;
        lastData = data;

        // If response is HTTP 200 OK and contains valid status payload
        if (res.ok && data) {
          break;
        }
      } catch (e) {
        console.error(`Error querying AzamPay status at ${req.url}:`, e);
      }
    }

    if (!lastRes || !lastRes.ok || !lastData) {
      const httpStatus = lastRes ? lastRes.status : 500;
      const errorDetail =
        httpStatus === 404
          ? `Transaction reference not found on AzamPay gateway (HTTP 404)`
          : `AzamPay status query returned HTTP ${httpStatus}: ${lastData?.message || lastResText || 'Unknown error'}`;

      return {
        success: false,
        status: 'pending',
        error_code: httpStatus,
        error: errorDetail,
        message: errorDetail,
        raw_response: lastData || { status: httpStatus, body: lastResText },
      };
    }

    // Parse status from response
    const rawStatus = String(
      lastData?.data?.status ||
      lastData?.data?.transactionStatus ||
      lastData?.status ||
      lastData?.transactionStatus ||
      (lastData?.success === true ? 'SUCCESS' : lastData?.success === false ? 'FAILED' : 'PENDING')
    ).toUpperCase();

    let status = 'pending';
    if (['SUCCESS', 'COMPLETED', 'PAID', 'SUCCESSFUL', 'APPROVED'].includes(rawStatus)) {
      status = 'success';
    } else if (['FAILED', 'DECLINED', 'REJECTED', 'EXPIRED', 'ERROR', 'CANCELLED'].includes(rawStatus)) {
      status = 'failed';
    }

    const gatewayRef = lastData?.data?.transactionId || lastData?.transactionId || gatewayReference;

    return {
      success: true,
      status,
      gateway_reference: gatewayRef,
      raw_response: lastData || { status: lastRes.status, body: lastResText },
      message:
        status === 'success'
          ? 'Payment confirmed successfully via AzamPay status query'
          : status === 'failed'
          ? 'Payment failed or declined according to AzamPay status query'
          : 'Payment is still pending on AzamPay gateway',
    };
  }

  /**
   * Returns 'valid' | 'invalid' | 'unsigned'.
   * Unsigned callbacks are not trusted by the caller; it confirms the status
   * with checkTransactionStatus() instead of applying the callback body.
   */
  async verifyWebhookSignature(dbClient, headers, rawBody, bodyData = {}) {
    const signature = headers.get('x-signature') || headers.get('signature');
    if (!signature) {
      return 'unsigned';
    }

    const secret = ((await dbClient.getGatewayConfig('azampay', 'client_secret')) || '').trim();
    if (!secret) {
      return 'unsigned';
    }

    const computed = await hmacSha256(secret, rawBody || '');
    const provided = String(signature).trim().replace(/^sha256=/i, '').toLowerCase();
    return safeEqual(provided, computed) ? 'valid' : 'invalid';
  }

  parseCallback(data) {
    const orderId = data.utilityref || data.externalId || data.externalreference || data.order_id || null;
    const reference = data.reference || data.transid || data.transactionId || data.mnoreference || null;
    const amount = data.amount ? parseFloat(data.amount) : 0.0;

    const rawStatus = String(data.transactionstatus || data.transactionStatus || data.status || '').toLowerCase();
    let status = 'failed';
    if (['success', 'completed', 'paid', 'successful', 'approved'].includes(rawStatus)) {
      status = 'success';
    }

    return {
      external_reference: orderId,
      gateway: 'azampay',
      gateway_reference: reference,
      amount,
      status,
      phone: data.msisdn || data.accountNumber || '',
      message: data.message || (status === 'success' ? 'Payment completed successfully' : 'Payment failed'),
      timestamp: new Date().toISOString(),
    };
  }

  normalizeProvider(provider) {
    if (!provider) return null;
    const p = String(provider).trim().toLowerCase();
    if (['mpesa', 'vodacom', 'voda'].includes(p)) return 'Mpesa';
    if (['tigo', 'tigopesa', 'zantel', 'yas'].includes(p)) return 'Tigo';
    if (['airtel', 'airtelmoney'].includes(p)) return 'Airtel';
    if (['halopesa', 'halotel'].includes(p)) return 'Halopesa';
    if (['azampesa', 'azam', 'ttcl'].includes(p)) return 'Azampesa';
    return provider;
  }

  detectOperator(phone) {
    const cleaned = this.formatPhoneNumber(phone);

    if (/^255(74|75|76|79)/.test(cleaned)) return 'Mpesa';
    if (/^255(65|67|71|77)/.test(cleaned)) return 'Tigo';
    if (/^255(68|69|78)/.test(cleaned)) return 'Airtel';
    if (/^255(61|62)/.test(cleaned)) return 'Halopesa';
    if (/^255(73)/.test(cleaned)) return 'Azampesa';

    return null;
  }

  formatPhoneNumber(phone) {
    let p = String(phone || '').replace(/[^0-9]/g, '').trim();
    if (p.startsWith('0')) {
      p = '255' + p.substring(1);
    }
    if (p.startsWith('2550')) {
      p = '255' + p.substring(4);
    }
    if (p.length === 9) {
      p = '255' + p;
    }
    return p;
  }
}

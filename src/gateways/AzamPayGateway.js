import crypto from 'node:crypto';

export class AzamPayGateway {
  getName() {
    return 'azampay';
  }

  async initiatePayment(dbClient, params) {
    const rawBaseUrl = await dbClient.getConfig('azampay_base_url');
    const rawAuthBaseUrl = await dbClient.getConfig('azampay_auth_base_url');

    if (!rawAuthBaseUrl || !rawBaseUrl) {
      return {
        success: false,
        error:
          'AzamPay Base URL or Auth Base URL is not configured. If testing in Sandbox, please click "⚡ Switch Gateway URLs to Sandbox Emulator" on the Sandbox page to set sandbox endpoints.',
        raw_response: {
          azampay_base_url: rawBaseUrl,
          azampay_auth_base_url: rawAuthBaseUrl,
        },
      };
    }

    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const authBaseUrl = rawAuthBaseUrl.replace(/\/+$/, '');

    const clientId = await dbClient.getConfig('azampay_client_id');
    const clientSecret = await dbClient.getConfig('azampay_client_secret');
    const appName = await dbClient.getConfig('azampay_app_name');
    const apiKey = await dbClient.getConfig('azampay_api_key');

    const phone = this.formatPhoneNumber(params.phone || '');
    const provider = params.provider || this.detectOperator(phone);

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

    try {
      const tokenRes = await fetch(`${authBaseUrl}/AppRegistration/GenerateToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          appName,
          clientId,
          clientSecret,
        }),
      });

      rawText = await tokenRes.text().catch(() => '');
      try {
        tokenData = JSON.parse(rawText);
      } catch (e) {
        tokenData = null;
      }

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
          (tokenRes.status === 404
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
    const externalId = params.external_reference || `GTY-1-${Date.now()}`;
    const payload = {
      amount: String(params.amount),
      currency: 'TZS',
      accountNumber: phone,
      externalId,
      provider,
    };

    try {
      const checkoutRes = await fetch(`${baseUrl}/azampay/mno/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-API-KEY': apiKey,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const checkoutText = await checkoutRes.text().catch(() => '');
      let responseBody = null;
      try {
        responseBody = JSON.parse(checkoutText);
      } catch (e) {
        responseBody = null;
      }

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

      return {
        success: false,
        error: responseBody?.message || `Gateway failed to initiate payment (HTTP ${checkoutRes.status})`,
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

  async verifyWebhookSignature(dbClient, headers, rawBody) {
    const signature = headers.get('x-signature') || headers.get('signature');
    if (!signature) {
      return true; // If no signature provided in emulator/sandbox, pass through
    }

    const secret = await dbClient.getConfig('azampay_client_secret');
    if (!secret) return true;

    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody || '')
      .digest('hex');

    return signature.toLowerCase() === computed.toLowerCase();
  }

  parseCallback(data) {
    const orderId = data.utilityref || data.externalId || null;
    const reference = data.transactionId || null;
    const amount = data.amount ? parseFloat(data.amount) : 0.0;

    const statusVal = String(data.status || '').toLowerCase();
    let status = 'failed';
    if (statusVal === 'success' || statusVal === 'completed' || statusVal === 'paid') {
      status = 'success';
    }

    return {
      external_reference: orderId,
      gateway: 'azampay',
      gateway_reference: reference,
      amount,
      status,
      phone: data.msisdn || '',
      message: data.message || (status === 'success' ? 'Payment succeeded' : 'Payment failed'),
      timestamp: new Date().toISOString(),
    };
  }

  detectOperator(phone) {
    const cleaned = this.formatPhoneNumber(phone);

    if (/^255(75|76|74|61|79)/.test(cleaned)) return 'Mpesa';
    if (/^255(65|67|71)/.test(cleaned)) return 'Tigo';
    if (/^255(68|69|78)/.test(cleaned)) return 'Airtel';
    if (/^255(62)/.test(cleaned)) return 'Halopesa';
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

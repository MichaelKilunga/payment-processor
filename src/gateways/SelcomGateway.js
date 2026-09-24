import crypto from 'node:crypto';
import { logOutboundRequest } from '../utils/outboundLogger.js';

export class SelcomGateway {
  getName() {
    return 'selcom';
  }

  async initiatePayment(dbClient, params, originUrl = '', targetEnv = null) {
    const envMode = targetEnv || params.environment || null;
    const rawBaseUrl = await dbClient.getGatewayConfig('selcom', 'base_url', envMode);
    if (!rawBaseUrl) {
      return {
        success: false,
        error:
          'Selcom Base URL is not configured. Please check your Selcom configuration panel.',
        raw_response: { selcom_base_url: rawBaseUrl },
      };
    }

    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const apiKey = await dbClient.getGatewayConfig('selcom', 'api_key', envMode);
    const apiSecret = await dbClient.getGatewayConfig('selcom', 'secret_key', envMode);
    const vendor = await dbClient.getGatewayConfig('selcom', 'vendor', envMode);
    const webappCallbackUrl = await dbClient.getConfig('webapp_callback_url');

    const orderId = params.external_reference || `SEL-${Date.now()}`;
    const phone = this.formatPhoneNumber(params.phone || '');

    const redirect = btoa(`${webappCallbackUrl}?status=success&ref=${orderId}`);
    const cancel = btoa(`${webappCallbackUrl}?status=cancelled&ref=${orderId}`);
    const webhookUrl = `${originUrl}/api/v1/callbacks/selcom`;

    const orderMinArray = {
      vendor,
      order_id: orderId,
      buyer_email: params.email || 'customer@example.com',
      buyer_name: params.name || 'Guest Customer',
      buyer_phone: phone,
      amount: parseInt(params.amount, 10),
      currency: 'TZS',
      redirect_url: redirect,
      cancel_url: cancel,
      webhook: webhookUrl,
      buyer_remarks: params.remarks || 'Payment',
      merchant_remarks: `Order ${orderId}`,
      no_of_items: 1,
    };

    const headers = this.computeHeaders(orderMinArray, apiKey, apiSecret);
    const start = Date.now();

    try {
      const response = await fetch(`${baseUrl}/checkout/create-order-minimal`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderMinArray),
      });

      const rawText = await response.text().catch(() => '');
      let responseBody = null;
      try {
        responseBody = JSON.parse(rawText);
      } catch (e) {
        responseBody = null;
      }

      await logOutboundRequest(dbClient, {
        method: 'POST',
        url: `${baseUrl}/checkout/create-order-minimal`,
        headers,
        requestBody: orderMinArray,
        responseStatus: response.status,
        responseBody: responseBody || rawText,
        durationMs: Date.now() - start,
        externalReference: orderId,
        gateway: 'selcom',
      });

      if (
        response.ok &&
        responseBody &&
        String(responseBody.result || '').toLowerCase() === 'success'
      ) {
        const data = responseBody.data?.[0] || {};
        let paymentUrl = null;
        if (data.payment_gateway_url) {
          try {
            paymentUrl = atob(data.payment_gateway_url);
          } catch (e) {
            paymentUrl = data.payment_gateway_url;
          }
        }

        return {
          success: true,
          gateway_reference: data.reference || null,
          payment_url: paymentUrl,
          raw_response: responseBody,
        };
      }

      return {
        success: false,
        error: responseBody?.message || `Gateway failed to initiate payment (HTTP ${response.status})`,
        raw_response: responseBody || { status: response.status, body: rawText },
      };
    } catch (e) {
      console.error('Selcom initiatePayment error:', e);
      return {
        success: false,
        error: `Connection to Selcom failed: ${e.message}`,
        raw_response: { exception: e.message },
      };
    }
  }

  async checkTransactionStatus(dbClient, externalReference, gatewayReference = null, targetEnv = null) {
    const rawBaseUrl = await dbClient.getGatewayConfig('selcom', 'base_url', targetEnv);
    if (!rawBaseUrl) {
      return {
        success: false,
        status: 'pending',
        error: 'Selcom Base URL is not configured.',
      };
    }

    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const apiKey = await dbClient.getGatewayConfig('selcom', 'api_key', targetEnv);
    const apiSecret = await dbClient.getGatewayConfig('selcom', 'secret_key', targetEnv);

    const statusArray = {
      order_id: externalReference,
    };
    const headers = this.computeHeaders(statusArray, apiKey, apiSecret);
    const start = Date.now();

    try {
      const response = await fetch(`${baseUrl}/checkout/order-status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(statusArray),
      });

      const rawText = await response.text().catch(() => '');
      let responseBody = null;
      try { responseBody = JSON.parse(rawText); } catch (e) {}

      await logOutboundRequest(dbClient, {
        method: 'POST',
        url: `${baseUrl}/checkout/order-status`,
        headers,
        requestBody: statusArray,
        responseStatus: response.status,
        responseBody: responseBody || rawText,
        durationMs: Date.now() - start,
        externalReference,
        gateway: 'selcom',
      });

      const data = responseBody?.data?.[0] || {};
      const result = String(responseBody?.result || data.result || '').toLowerCase();
      const resultCode = String(data.resultcode || responseBody?.resultcode || '');

      let status = 'pending';
      if (result === 'success' || resultCode === '000' || data.payment_status === 'COMPLETED') {
        status = 'success';
      } else if (result === 'fail' || result === 'failed' || (resultCode && resultCode !== '000')) {
        status = 'failed';
      }

      return {
        success: true,
        status,
        gateway_reference: data.reference || gatewayReference,
        raw_response: responseBody || { status: response.status, body: rawText },
        message: status === 'success'
          ? 'Payment confirmed successfully via Selcom status query'
          : status === 'failed'
          ? 'Payment failed or declined according to Selcom status query'
          : 'Payment is still pending on Selcom gateway',
      };
    } catch (e) {
      console.error('Error querying Selcom status:', e);
      return {
        success: false,
        status: 'pending',
        error: `Selcom status query failed: ${e.message}`,
      };
    }
  }

  async verifyWebhookSignature(dbClient, headers, requestData) {
    const digestHeader = headers.get('digest');
    const timestamp = headers.get('timestamp');
    const signedFields = headers.get('signed-fields');

    if (!digestHeader || !timestamp || !signedFields) {
      return false;
    }

    const apiSecret = await dbClient.getGatewayConfig('selcom', 'secret_key');
    if (!apiSecret) return false;

    const fields = signedFields.split(',');
    let data = `timestamp=${timestamp}`;

    for (const field of fields) {
      if (requestData[field] === undefined) {
        return false;
      }
      data += `&${field}=${String(requestData[field])}`;
    }

    const computed = crypto
      .createHmac('sha256', apiSecret)
      .update(data)
      .digest('base64');

    return digestHeader === computed;
  }

  parseCallback(data) {
    const orderId = data.order_id || data.utilityref || null;
    const reference = data.reference || data.transid || null;
    const amount = data.amount ? parseFloat(data.amount) : 0.0;

    const result = String(data.result || '').toLowerCase();
    const resultCode = String(data.resultcode || '');

    let status = 'failed';
    if (result === 'success' || resultCode === '000') {
      status = 'success';
    }

    return {
      external_reference: orderId,
      gateway: 'selcom',
      gateway_reference: reference,
      amount,
      status,
      phone: data.msisdn || '',
      message: data.message || (status === 'success' ? 'Payment succeeded' : 'Payment failed'),
      timestamp: new Date().toISOString(),
    };
  }

  computeHeaders(arrayData, apiKey, apiSecret) {
    const authToken = 'SELCOM ' + btoa(apiKey || '');
    const signedFields = Object.keys(arrayData).join(',');
    const fieldOrder = signedFields.split(',');

    const timestamp = new Date().toISOString();

    let data = `timestamp=${timestamp}`;
    for (const key of fieldOrder) {
      data += `&${key}=${String(arrayData[key])}`;
    }

    const digest = crypto
      .createHmac('sha256', apiSecret || '')
      .update(data)
      .digest('base64');

    return {
      Authorization: authToken,
      'Digest-Method': 'HS256',
      Timestamp: timestamp,
      Digest: digest,
      'Signed-Fields': signedFields,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
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

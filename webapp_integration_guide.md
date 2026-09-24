# Payment Processor Integration Guide

This guide explains how to connect your web application to the Payment Processor API.

---

## Service Information

* **Production URL**: `https://payment-processor.kahingaarnold2.workers.dev`
* **Supported Gateways**: Selcom · AzamPay
* **Sandbox & Emulator**: `https://payment-processor.kahingaarnold2.workers.dev/emulator`

---

## How It Works

The Payment Processor manages payment routing behind the scenes.

* **No provider selection needed**: Your web app does not need to manage provider differences between M-Pesa, Tigo, Airtel Money, Selcom, or AzamPay. The active gateway is managed via the Payment Processor admin dashboard.
* **USSD Push & Card Payments**: Initiating payment triggers a USSD push prompt on the customer's mobile phone asking for their PIN, or generates a hosted payment URL for card checkout.
* **Asynchronous Webhook Callbacks**: When the payment completes or fails, the processor automatically notifies your application via a webhook callback.

---

## 1. Initiate a Payment

When a customer checks out, send a `POST` request to initiate payment.

### Endpoint

```http
POST https://payment-processor.kahingaarnold2.workers.dev/api/v1/payments/initiate
Content-Type: application/json
Accept: application/json
```

### Request Payload

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | numeric | Yes | Amount in TZS (minimum: `1`) |
| `phone` | string | Yes | Customer phone number (e.g. `0712345678` or `255712345678`) |
| `external_reference` | string | Yes | Unique order or invoice reference from your system |
| `name` | string | No | Customer full name |
| `email` | string | No | Customer email address |
| `remarks` | string | No | Optional description or notes |

### Example Request

```json
{
  "amount": 15000,
  "phone": "0712345678",
  "external_reference": "INV-2026-881",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "remarks": "Order #INV-2026-881"
}
```

### Response Handling

#### Success (`success: true`)
A USSD prompt has been sent to the customer's phone or a hosted payment URL was generated.

```json
{
  "success": true,
  "external_reference": "INV-2026-881",
  "gateway_reference": "REF-89109312",
  "payment_url": null,
  "message": "Payment initiated successfully."
}
```

**UI Recommendation**: Display a waiting message asking the customer to check their mobile phone and enter their PIN to authorize the payment.

#### Error (`success: false`)
The request failed.

```json
{
  "success": false,
  "external_reference": "INV-2026-881",
  "message": "Invalid phone number format."
}
```

---

## 2. Receive Webhook Callbacks

Once the customer completes the payment (or if it fails), the processor posts a notification payload to your application callback URL.

### Configuring Your Webhook URL
In the Payment Processor **Admin Control Panel** (`https://payment-processor.kahingaarnold2.workers.dev/`), set your **WebApp Callback URL**:
`https://yourwebapp.com/api/v1/payments/callback`

### Webhook Payload Format

```json
{
  "external_reference": "INV-2026-881",
  "gateway": "azampay",
  "gateway_reference": "REF-89109312",
  "amount": 15000.00,
  "status": "success",
  "phone": "255712345678",
  "message": "Payment completed successfully",
  "timestamp": "2026-09-23T01:30:00.000Z"
}
```

* `status` will be either `"success"` or `"failed"`.
* Your callback endpoint must return an **HTTP 200 OK** response.

---

## 3. Manual Status Check & Fallbacks

If a webhook callback is delayed or when polling status from your web app frontend, your backend can query transaction status directly.

### Automatic Live Gateway Query Fallback

When a status check request is received by the processor:
- If the transaction status is **not yet updated (`pending`)**, the processor automatically queries **AzamPay** (or Selcom) directly.
- If AzamPay confirms the payment is `success` or `failed`, the processor automatically updates its database, posts the callback to your WebApp callback URL, and returns the updated feedback payload immediately!

### Status Check Endpoints

```http
GET https://payment-processor.kahingaarnold2.workers.dev/api/v1/payments/status/{external_reference}
POST https://payment-processor.kahingaarnold2.workers.dev/api/v1/payments/check-status
Content-Type: application/json
```

#### Request Payload (POST)
```json
{
  "external_reference": "INV-2026-881"
}
```

### Response Example

```json
{
  "success": true,
  "external_reference": "INV-2026-881",
  "status": "success",
  "amount": 15000.00,
  "gateway": "azampay",
  "gateway_reference": "REF-89109312",
  "checked_remote": true,
  "remote_detail": "Payment confirmed successfully via AzamPay status query",
  "message": "Payment completed successfully",
  "created_at": "2026-09-24T18:00:00.000Z",
  "updated_at": "2026-09-24T18:00:05.000Z"
}
```

---

## 4. Full Request Logging & Traffic Inspector

Every request received from your web app and every request sent to gateway providers or web app callbacks is logged with full details (headers, payload, status code, latency).

- **View Live Traffic**: Open Control Panel → **Request Inspector** tab.
- **Fetch Logs via API**: `GET /api/v1/requests`

---

## Code Examples

### PHP (Laravel)

```php
namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    private string $processorUrl = 'https://payment-processor.kahingaarnold2.workers.dev';

    public function checkout(Order $order)
    {
        $response = Http::post($this->processorUrl . '/api/v1/payments/initiate', [
            'amount'             => $order->total_amount,
            'phone'              => $order->customer_phone,
            'external_reference' => $order->id,
            'name'               => $order->customer_name,
            'email'              => $order->customer_email,
            'remarks'            => 'Order #' . $order->id,
        ]);

        $result = $response->json();

        if ($response->successful() && !empty($result['success'])) {
            return view('checkout.waiting', [
                'order' => $order,
                'phone' => $order->customer_phone
            ]);
        }

        return back()->with('error', $result['message'] ?? 'Could not initiate payment.');
    }

    public function recheckStatus(string $orderId)
    {
        $response = Http::get($this->processorUrl . "/api/v1/payments/status/{$orderId}");
        $result = $response->json();

        if (!empty($result['success'])) {
            $order = Order::find($orderId);
            if ($order && $result['status'] === 'success') {
                $order->update(['status' => 'paid']);
                return back()->with('success', 'Payment confirmed.');
            } elseif ($order && $result['status'] === 'failed') {
                $order->update(['status' => 'failed']);
                return back()->with('error', 'Payment failed.');
            }
        }

        return back()->with('info', 'Payment is pending.');
    }

    public function handleWebhook(Request $request)
    {
        $order = Order::find($request->input('external_reference'));
        if ($order) {
            $status = $request->input('status') === 'success' ? 'paid' : 'failed';
            $order->update(['status' => $status]);
        }

        return response()->json(['status' => 'ok']);
    }
}
```

---

### Node.js (Express & Axios)

```javascript
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PROCESSOR_URL = 'https://payment-processor.kahingaarnold2.workers.dev';

app.post('/checkout', async (req, res) => {
  const { amount, phone, orderId, name, email } = req.body;

  try {
    const { data } = await axios.post(`${PROCESSOR_URL}/api/v1/payments/initiate`, {
      amount,
      phone,
      external_reference: orderId,
      name,
      email
    });

    if (data.success) {
      return res.json({ success: true, message: 'Payment initiated successfully.' });
    }
    return res.status(400).json({ success: false, error: data.message });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.response?.data?.message || 'Server error' });
  }
});

app.get('/recheck-status/:orderId', async (req, res) => {
  try {
    const { data } = await axios.get(`${PROCESSOR_URL}/api/v1/payments/status/${req.params.orderId}`);
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Status check failed' });
  }
});

app.post('/api/v1/payments/callback', (req, res) => {
  const { external_reference, status } = req.body;
  console.log(`Order ${external_reference} status update: ${status}`);

  return res.status(200).send('OK');
});
```

---

### cURL Examples

```bash
# 1. Initiate payment
curl -X POST https://payment-processor.kahingaarnold2.workers.dev/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "phone": "0712345678",
    "external_reference": "INV-2026-881"
  }'

# 2. Check payment status
curl -X GET https://payment-processor.kahingaarnold2.workers.dev/api/v1/payments/status/INV-2026-881
```

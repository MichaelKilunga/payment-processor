# Payment Processor Integration Guide

Comprehensive integration documentation for web application developers connecting to the **Payment Processor Middleware API**.

---

## 1. Overview & Architecture

The Payment Processor is a standalone middleware service built on **Cloudflare Workers** and **Cloudflare D1**. It unifies payment gateways in Tanzania (**AzamPay** and **Selcom**) into a single, standardized REST API for your web application.

### Key Benefits

- **Single API Integration**: Your web application interacts with one clean API. Mobile money operator detection (Vodacom M-Pesa, Tigo Pesa, Airtel Money, HaloPesa, AzamPesa) and gateway switching are handled automatically behind the scenes.
- **USSD Push & Card Payments**: Initiates direct USSD PIN prompt triggers to the customer's phone or generates hosted checkout URLs for card payments.
- **Real-Time Webhooks**: Asynchronously notifies your web application via HTTP POST webhooks upon payment completion or failure.
- **Auto-Fallback Status Queries**: Automatically queries live gateway provider APIs directly if a transaction status is pending during a status check.
- **Authenticated & Signed Channel**: Every API call is authenticated with an API key (optionally HMAC-signed), and every webhook sent to your web app is HMAC-signed with a dedicated secret and carries a unique event id.

### Flow Diagram

```
┌────────────────────────────────┐
│        Customer WebApp         │
└───────────────┬────────────────┘
                │ 1. POST /api/v1/payments/initiate  (Authorization: Bearer <API key>)
                ▼
┌────────────────────────────────┐
│   Payment Processor Middleware │
└───────────────┬────────────────┘
                │ 2. Trigger USSD Push / Hosted Checkout
                ▼
┌────────────────────────────────┐
│  Gateways (AzamPay / Selcom)   │ ──► Customer Enters PIN on Phone
└───────────────┬────────────────┘
                │ 3. Webhook / Callback Notification
                ▼
┌────────────────────────────────┐
│   Payment Processor Middleware │
└───────────────┬────────────────┘
                │ 4. Forward Signed Webhook (HTTP POST + X-PP-Signature)
                ▼
┌────────────────────────────────┐
│   Your Web App Callback URL    │ ──► Update Order Status to Paid / Failed
└────────────────────────────────┘
```

---

## 2. Environment Setup

### Endpoints

| Environment | Base URL | Admin Panel & Traffic Inspector |
|---|---|---|
| **Production** | `https://payment-processor.kahingaarnold2.workers.dev` | `https://payment-processor.kahingaarnold2.workers.dev/` |
| **Sandbox / Emulator** | `https://payment-processor.kahingaarnold2.workers.dev` | `https://payment-processor.kahingaarnold2.workers.dev/emulator` |

### Web Application Environment Variables

Add the following configuration variables to your web application's `.env` file:

```env
# Payment Processor Base URL
PAYMENT_PROCESSOR_URL=https://payment-processor.kahingaarnold2.workers.dev

# API key issued by the processor dashboard (Admin Security -> Web App Integration -> Generate API Key)
PAYMENT_PROCESSOR_API_KEY=pp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook signing secret issued by the processor dashboard (Generate Webhook Secret)
PAYMENT_PROCESSOR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Web App Public Webhook Endpoint (Where payment notifications will be received) - ensure this is available i your web app
WEBAPP_CALLBACK_URL=https://duka.now/api/v1/payments/callback
```

---

## 3. Step-by-Step Integration

---

### Step 0: Authenticate Every Request

All `/api/v1/payments/*` endpoints require the API key on every call. Requests without a valid key receive `401 Unauthorized`.

```http
Authorization: Bearer pp_live_xxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

`X-API-Key: <key>` is accepted as an alternative header. Keep the key server-side only; never ship it to a browser or mobile client. When you rotate the key from the dashboard, the previous key keeps working for 24 hours so you can deploy the new one without downtime.

#### Optional: Signed Requests (recommended for production)

Signing protects against replay and tampering even if TLS is terminated by a proxy. Add two headers:

```http
X-PP-Timestamp: 1760000000                      # unix seconds
X-PP-Signature: <hex HMAC-SHA256>               # key = your API key
```

The signed string is `${timestamp}.${METHOD}.${pathname}.${rawBody}`, for example
`1760000000.POST./api/v1/payments/initiate.{"amount":15000,...}`. Use the exact bytes you send as the body, and an empty string for GET. Requests older than 5 minutes are rejected. Signatures are always verified when present; the dashboard toggle **Require signed requests** makes them mandatory.

```javascript
const crypto = require('crypto');
function signRequest(apiKey, method, pathname, rawBody = '') {
  const ts = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', apiKey).update(`${ts}.${method.toUpperCase()}.${pathname}.${rawBody}`).digest('hex');
  return { 'X-PP-Timestamp': String(ts), 'X-PP-Signature': sig };
}
```

---

### Step 1: Initiate a Payment

When a customer subscribe, your web application backend sends a `POST` request to initiate payment.

#### Endpoint

```http
POST /api/v1/payments/initiate
Authorization: Bearer <PAYMENT_PROCESSOR_API_KEY>
Content-Type: application/json
Accept: application/json
```

#### Request Payload Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `amount` | number / string | **Yes** | Payment amount in TZS (minimum: `1`). | `15000` |
| `phone` | string | **Yes** | Customer phone number (supports local `07...` or intl `255...`). | `"0712345678"` |
| `external_reference` | string | **Yes** | Unique Order ID or Invoice ID generated by your web app. | `"INV-2026-881"` |
| `name` | string | No | Customer full name. | `"Jane Doe"` |
| `email` | string | No | Customer email address. | `"jane@example.com"` |
| `remarks` | string | No | Description or item breakdown. | `"Order #INV-2026-881"` |
| `gateway` | string | No | Override active gateway (`"azampay"` or `"selcom"`). If omitted, uses dashboard active gateway. | `"azampay"` |

#### Example Request

```json
{
  "amount": 15000,
  "phone": "0712345678",
  "external_reference": "INV-2026-881",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "remarks": "Subscription #INV-2026-881"
}
```

#### Success Response (`200 OK`)

```json
{
  "success": true,
  "external_reference": "INV-2026-881",
  "gateway_reference": "REF-89109312",
  "payment_url": null,
  "message": "Payment initiated successfully."
}
```

> **Frontend UX Guidance**: When `success` is `true`, display a modal/screen asking the customer to check their mobile phone and enter their Mobile Money PIN. If `payment_url` is provided (for card checkout), redirect the customer to `payment_url`.

#### Error Responses

| Status | Meaning |
|---|---|
| `400` | Validation error (see `message`) |
| `401` | Missing or invalid API key, or rejected request signature |
| `409` | This `external_reference` has already been paid |
| `429` | Rate limit hit (per IP, or more than 5 initiations per phone per minute) |
| `502` | The gateway rejected or failed the initiation |

Example (`400`):

```json
{
  "success": false,
  "external_reference": "INV-2026-881",
  "message": "The phone field is required."
}
```

---

### Step 2: Receive & Handle Webhook Callbacks

When the customer completes the payment (or if it fails), the processor sends an HTTP `POST` webhook to your configured `WEBAPP_CALLBACK_URL`.

#### 1. Configuring Your Callback URL
In the Payment Processor Admin Dashboard (`/`), set the **WebApp Callback URL**:
`https://yourwebapp.com/api/v1/payments/callback`

The URL must use HTTPS (plain HTTP is only accepted for localhost and private-network addresses during development). Exclude this route from CSRF protection and from any session/login middleware; it is authenticated by the webhook signature below.

#### 2. Webhook Payload Format

```json
{
  "event_id": "evt_3f1c9b7e-5d2a-4c1e-9a7b-0d2f6e8c1a44",
  "external_reference": "INV-2026-881",
  "gateway": "azampay",
  "gateway_reference": "REF-89109312",
  "amount": 15000.00,
  "status": "success",
  "phone": "255712345678",
  "message": "Payment completed successfully",
  "timestamp": "2026-09-24T19:30:00.000Z"
}
```

#### Field Definitions

- `event_id`: Unique id for this notification. Store it and ignore repeats.
- `external_reference`: The Order ID sent during payment initiation.
- `status`: `"success"` or `"failed"`.
- `gateway_reference`: Unique transaction ID issued by the gateway provider.
- `amount`: Confirmed transaction amount.
- `source`: What produced the notification: `gateway_callback` (the gateway called us), `status_query` (a status check confirmed it with the gateway) or `pending_timeout` (the pending lifespan elapsed, see below).

#### Pending lifespan and late callbacks

A USSD push the customer ignores or cancels never produces a final status from some MNOs. The processor therefore marks a payment that is still `pending` after the configured lifespan (dashboard General Settings, default 30 minutes) as `failed` and sends you a webhook with `source: "pending_timeout"`. The check runs every 5 minutes and on every status query.

If the gateway later reports that the customer did pay, the processor upgrades the payment from `failed` to `success` and sends another webhook. Your handler must therefore allow a `failed` order to become `paid` later, and must never treat `failed` as permanent for refunds or stock decisions until the amount has actually been reconciled.

#### 3. Verify the Webhook Signature (required)

Every webhook carries these headers:

| Header | Meaning |
|---|---|
| `X-PP-Event-Id` | Same as `event_id` in the body |
| `X-PP-Event-Type` | `payment.success`, `payment.failed` or `payment.pending` |
| `X-PP-Timestamp` | Unix seconds when the webhook was signed |
| `X-PP-Signature` | `t=<timestamp>,v1=<hex HMAC-SHA256>` |
| `X-PP-Delivery-Attempt` | 1 for the first delivery, higher for retries |

The signature is `HMAC-SHA256(webhook_secret, `${timestamp}.${rawBody}`)` where `rawBody` is the exact request body bytes. Verify before parsing JSON, compare in constant time, and reject timestamps older than 5 minutes. Treat any request that fails verification as hostile and return `401`.

**Node.js (Express)** - mount with `express.raw({ type: 'application/json' })` so the raw body is available:

```javascript
const crypto = require('crypto');

function verifyProcessorWebhook(req, secret, toleranceSec = 300) {
  const header = req.get('X-PP-Signature') || '';
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')));
  const ts = Number(parts.t);
  if (!ts || !parts.v1 || Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${ts}.${req.body.toString('utf8')}`).digest('hex');
  const a = Buffer.from(parts.v1, 'hex'), b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

app.post('/api/v1/payments/callback', express.raw({ type: 'application/json' }), (req, res) => {
  if (!verifyProcessorWebhook(req, process.env.PAYMENT_PROCESSOR_WEBHOOK_SECRET)) return res.status(401).end();
  const event = JSON.parse(req.body.toString('utf8'));
  // ... idempotency check on event.event_id, then fulfil
  res.status(200).json({ received: true });
});
```

**PHP (Laravel)**

```php
function verifyProcessorWebhook(Request $request, string $secret, int $tolerance = 300): bool
{
    $header = $request->header('X-PP-Signature', '');
    $parts = [];
    foreach (explode(',', $header) as $pair) {
        [$k, $v] = array_pad(explode('=', $pair, 2), 2, '');
        $parts[$k] = $v;
    }
    $ts = (int) ($parts['t'] ?? 0);
    if (!$ts || empty($parts['v1']) || abs(time() - $ts) > $tolerance) {
        return false;
    }
    $expected = hash_hmac('sha256', $ts . '.' . $request->getContent(), $secret);
    return hash_equals($expected, strtolower($parts['v1']));
}
```

**Python (FastAPI)**

```python
import hmac, hashlib, time

def verify_processor_webhook(signature_header: str, raw_body: bytes, secret: str, tolerance: int = 300) -> bool:
    parts = dict(p.split("=", 1) for p in signature_header.split(",") if "=" in p)
    try:
        ts = int(parts.get("t", "0"))
    except ValueError:
        return False
    if not ts or "v1" not in parts or abs(time.time() - ts) > tolerance:
        return False
    expected = hmac.new(secret.encode(), f"{ts}.".encode() + raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, parts["v1"].lower())
```

#### Webhook Best Practices

1. **Verify First**: Reject any webhook whose signature or timestamp does not validate. Never fulfil an order from an unsigned notification.
2. **Respond Quickly**: Return an HTTP `200 OK` status immediately after recording the event. Non-2xx responses are retried 3 times with increasing delays (2s, 6s, 15s).
3. **Idempotency**: Store `event_id` and skip events you have already processed. Also check the order is not already `paid`.
4. **Confirm Before Fulfilling High-Value Orders**: Call the authenticated status endpoint (Step 3) and compare `amount` with the order total before releasing goods.

---

### Step 3: Check Payment Status & Polling

Use status checks for backend verification, manual re-checks, or frontend polling while waiting for USSD completion.

#### Automatic Live Gateway Query Fallback
If the transaction in the middleware database is still `pending` when checked, the processor **automatically queries the gateway provider (AzamPay/Selcom) directly**. If confirmed, it updates its database, triggers the webhook callback to your web app, and returns the updated status immediately.

Note that AzamPay does not expose a status query for MNO (USSD push) checkout; its final status arrives only via callback. For AzamPay the live query therefore cannot finalize a payment, and the pending lifespan (above) is what eventually resolves abandoned prompts. The status response carries `expired: true` when this check was what marked the payment `failed`.

#### Endpoints

Both require the `Authorization: Bearer <API key>` header.

- **GET Method** (Recommended for REST polling):
  `GET /api/v1/payments/status/{external_reference}`

- **POST Method**:
  `POST /api/v1/payments/check-status`

#### Request Payload (POST Method)

```json
{
  "external_reference": "INV-2026-881"
}
```

#### Response Example (`200 OK`)

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

## 4. Code Implementation Examples

### Node.js (Express & Axios)

```javascript
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
// Note: mount express.json() per route; the webhook route needs the raw body (see below).

function verifyProcessorWebhook(req, secret, toleranceSec = 300) {
  const header = req.get('X-PP-Signature') || '';
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const ts = Number(parts.t);
  if (!ts || !parts.v1 || Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${ts}.${req.body.toString('utf8')}`).digest('hex');
  const a = Buffer.from(parts.v1, 'hex'), b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const PROCESSOR_URL = process.env.PAYMENT_PROCESSOR_URL || 'https://payment-processor.kahingaarnold2.workers.dev';
const PROCESSOR_API_KEY = process.env.PAYMENT_PROCESSOR_API_KEY; // from the processor dashboard
const processor = axios.create({
  baseURL: PROCESSOR_URL,
  headers: { Authorization: `Bearer ${PROCESSOR_API_KEY}` },
  timeout: 15000,
});

// 1. Checkout Endpoint
app.post('/api/checkout', express.json(), async (req, res) => {
  const { amount, phone, orderId, name, email } = req.body;

  try {
    const response = await processor.post('/api/v1/payments/initiate', {
      amount,
      phone,
      external_reference: orderId,
      name,
      email,
      remarks: `Order #${orderId}`
    });

    if (response.data.success) {
      return res.json({
        success: true,
        message: 'Payment initiated. Please check your phone for the USSD prompt.',
        gateway_reference: response.data.gateway_reference
      });
    }

    return res.status(400).json({ success: false, message: response.data.message });
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Payment initiation failed';
    return res.status(500).json({ success: false, message: errorMessage });
  }
});

// 2. Status Check Endpoint
app.get('/api/payment-status/:orderId', async (req, res) => {
  try {
    const response = await processor.get(`/api/v1/payments/status/${encodeURIComponent(req.params.orderId)}`);
    return res.json(response.data);
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Status check failed' });
  }
});

// 3. Webhook Callback Listener (raw body is required to verify the signature)
app.post('/api/v1/payments/callback', express.raw({ type: 'application/json' }), (req, res) => {
  if (!verifyProcessorWebhook(req, process.env.PAYMENT_PROCESSOR_WEBHOOK_SECRET)) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  }
  const { event_id, external_reference, status, gateway_reference, amount } = JSON.parse(req.body.toString('utf8'));

  // TODO: if (await eventAlreadyProcessed(event_id)) return res.status(200).json({ success: true });
  console.log(`Received callback for Order: ${external_reference}, Status: ${status}`);

  if (status === 'success') {
    // TODO: Update order status to paid in your database
    // updateOrderStatus(external_reference, 'paid', gateway_reference);
  } else {
    // TODO: Update order status to failed in your database
    // updateOrderStatus(external_reference, 'failed');
  }

  // Always respond with 200 OK
  return res.status(200).json({ success: true, message: 'Callback received' });
});

app.listen(3000, () => console.log('Web App running on port 3000'));
```

---

### PHP (Laravel)

```php
namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private string $processorUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->processorUrl = config('services.payment_processor.url', 'https://payment-processor.kahingaarnold2.workers.dev');
        $this->apiKey = config('services.payment_processor.api_key'); // PAYMENT_PROCESSOR_API_KEY
    }

    private function processor()
    {
        return Http::withToken($this->apiKey)->acceptJson()->timeout(15);
    }

    // 1. Initiate Payment
    public function checkout(Request $request, Order $order)
    {
        $response = $this->processor()->post("{$this->processorUrl}/api/v1/payments/initiate", [
            'amount'             => $order->total_amount,
            'phone'              => $request->input('phone'),
            'external_reference' => (string) $order->id,
            'name'               => $order->customer_name,
            'email'              => $order->customer_email,
            'remarks'            => "Order #{$order->id}"
        ]);

        $result = $response->json();

        if ($response->successful() && !empty($result['success'])) {
            return response()->json([
                'success' => true,
                'message' => 'Payment initiated. Enter PIN on your phone.',
                'order_id' => $order->id
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Could not initiate payment'
        ], 400);
    }

    // 2. Check Status
    public function checkStatus(string $orderId)
    {
        $response = $this->processor()->get("{$this->processorUrl}/api/v1/payments/status/{$orderId}");
        $result = $response->json();

        if (!empty($result['success']) && $result['status'] === 'success') {
            Order::where('id', $orderId)->update(['status' => 'paid']);
        }

        return response()->json($result);
    }

    // 3. Webhook Callback Handler (exclude this route from CSRF middleware)
    public function handleWebhook(Request $request)
    {
        if (!verifyProcessorWebhook($request, config('services.payment_processor.webhook_secret'))) {
            return response()->json(['success' => false, 'message' => 'Invalid webhook signature'], 401);
        }

        // TODO: skip if $request->input('event_id') was already processed
        $externalReference = $request->input('external_reference');
        $status = $request->input('status');

        Log::info("Payment Webhook received for Order {$externalReference}: {$status}");

        $order = Order::find($externalReference);
        if ($order && $order->status !== 'paid') {
            $newStatus = ($status === 'success') ? 'paid' : 'failed';
            $order->update(['status' => $newStatus]);
        }

        return response()->json(['success' => true], 200);
    }
}
```

---

### Python (FastAPI)

```python
from fastapi import FastAPI, HTTPException, Request
import httpx
import json
import os

app = FastAPI()
PROCESSOR_URL = os.getenv("PAYMENT_PROCESSOR_URL", "https://payment-processor.kahingaarnold2.workers.dev")
PROCESSOR_HEADERS = {"Authorization": f"Bearer {os.environ['PAYMENT_PROCESSOR_API_KEY']}"}

@app.post("/api/checkout")
async def initiate_payment(payload: dict):
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{PROCESSOR_URL}/api/v1/payments/initiate", headers=PROCESSOR_HEADERS, json={
            "amount": payload.get("amount"),
            "phone": payload.get("phone"),
            "external_reference": payload.get("order_id"),
            "name": payload.get("name"),
            "email": payload.get("email")
        })
        
        data = res.json()
        if res.status_code == 200 and data.get("success"):
            return {"success": True, "message": "Payment initiated successfully."}
        raise HTTPException(status_code=400, detail=data.get("message"))

@app.get("/api/payment-status/{order_id}")
async def get_payment_status(order_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{PROCESSOR_URL}/api/v1/payments/status/{order_id}", headers=PROCESSOR_HEADERS)
        return res.json()

@app.post("/api/v1/payments/callback")
async def payment_webhook(request: Request):
    raw = await request.body()
    if not verify_processor_webhook(request.headers.get("X-PP-Signature", ""), raw, os.environ["PAYMENT_PROCESSOR_WEBHOOK_SECRET"]):
        raise HTTPException(status_code=401, detail="invalid webhook signature")
    payload = json.loads(raw)
    order_id = payload.get("external_reference")
    status = payload.get("status")
    print(f"Webhook received for Order {order_id}: {status}")
    
    # Update order in DB
    return {"status": "ok"}
```

---

### cURL Examples

```bash
# 1. Initiate Payment
curl -X POST https://payment-processor.kahingaarnold2.workers.dev/api/v1/payments/initiate \
  -H "Authorization: Bearer $PAYMENT_PROCESSOR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "phone": "0712345678",
    "external_reference": "INV-2026-881",
    "name": "Jane Doe",
    "remarks": "Order #INV-2026-881"
  }'

# 2. Check Payment Status
curl -X GET https://payment-processor.kahingaarnold2.workers.dev/api/v1/payments/status/INV-2026-881 \
  -H "Authorization: Bearer $PAYMENT_PROCESSOR_API_KEY"

# 3. Request & Traffic Logs (Inspector API) - dashboard administrators only (session cookie), not available with the API key
```

---

## 5. Testing & Debugging Tools

### 1. Interactive Sandbox Emulator
To test payments without deducting real money:
- Configure the processor to Sandbox Mode:
  ```bash
  Log in to the dashboard and use the "Auto-Configure Sandbox" button on the Emulator page (this action requires an admin session and only works while the processor is in sandbox mode).
  ```
- Open the **Sandbox Terminal & Emulator UI**:
  `https://payment-processor.kahingaarnold2.workers.dev/emulator`

### 1b. Detecting Sandbox vs Live Mode Programmatically

```http
GET /api/v1/environment
Authorization: Bearer <API key>
```

```json
{ "success": true, "environment_mode": "sandbox", "is_sandbox": true, "active_gateway": "azampay", "emulator_enabled": true }
```

Call this at startup or before running automated tests and refuse to run test suites when `is_sandbox` is `false`.

### 1c. Forcing Sandbox Success / Failure Webhooks from Code

While the processor is in sandbox mode, initiate a payment as usual, then resolve it:

```http
POST /api/emulator/resolve-by-reference
Authorization: Bearer <API key>
Content-Type: application/json

{ "external_reference": "INV-2026-881", "action": "approve" }
```

`action` is `approve` (success webhook), `reject` (failed webhook) or `timeout` (failed webhook). The processor fires the emulated gateway callback, updates the transaction, and delivers a signed webhook to your callback URL exactly as in production. `GET /api/emulator/transactions` lists pending sandbox transactions. These endpoints return `403` when the processor is in live mode.

### 2. Request & Traffic Inspector
Every HTTP request and response processed by the middleware is logged with execution duration, status code, request body, and response body. Secrets (passwords, API keys, client secrets, tokens, signatures) are redacted before storage.
- **Web UI**: Log in at `https://payment-processor.kahingaarnold2.workers.dev/` and click the **Request Inspector** tab.
- **Inspector API**: `GET /api/v1/requests` is available only to logged-in dashboard administrators (session cookie); it does not accept the web app API key.

### 3. Postman Collection Testing
- Set Postman environment variables `base_url` to `https://payment-processor.kahingaarnold2.workers.dev` and `api_key` to your generated key.
- Add the header `Authorization: Bearer {{api_key}}` to the collection.
- Send requests to `/api/v1/payments/initiate`, `/api/v1/payments/status/:external_reference`, and `/api/v1/payments/check-status`.

### 4. Obtaining & Rotating Credentials
1. Log in to the dashboard and open **Admin Security & Passwords**.
2. Under **Web App Integration Credentials**, click **Generate API Key** and **Generate Webhook Secret**. Each value is displayed once; store them in your web app's environment.
3. Rotating the API key keeps the previous key valid for 24 hours. Rotating the webhook secret takes effect immediately, so update the web app at the same time.
4. Optional hardening: set **Allowed Browser Origins** only if a browser must call the API directly (not recommended), and enable **Require signed requests** once your client sends `X-PP-Timestamp` / `X-PP-Signature`.

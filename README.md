# Payment Processor Middleware (Cloudflare Workers + JavaScript)

A high-performance payment processor middleware built in pure JavaScript for **Cloudflare Workers**, **Hono**, and **Cloudflare D1**.

It acts as a standalone middleware service between your web application and mobile money payment gateways in Tanzania (**Selcom** and **AzamPay**).

---

## Features

- **Pure JavaScript & Cloudflare Workers**: Native V8 execution at global edge locations.
- **Selcom Gateway Driver**: Minimal Checkout API, HMAC SHA256 header generation, signature verification, and callback parsing.
- **AzamPay Gateway Driver**: Token generation, MNO checkout (USSD Push), automatic phone operator detection (Vodacom Mpesa, Tigo Pesa, Airtel Money, HaloPesa, AzamPesa), HMAC signature verification.
- **Serverless SQL Database (Cloudflare D1)**: Persistent storage for configurations, payment logs, and sandbox emulator transactions.
- **Admin Configuration Dashboard (`/`)**: Secure Web UI to manage credentials, active gateway driver, webapp callback URL, live connection testing, and transaction log management with CSV/JSON exports.
- **Dashboard Authentication & Access Control**: HTTP-Only, SameSite cookie sessions (HMAC-signed) protecting all management routes. Passwords are hashed with PBKDF2-SHA256; the built-in `admin` / `admin123` default only works on localhost. On any deployed host set the `ADMIN_PASSWORD` Worker secret or a custom password from the Security tab. Login attempts are rate limited.
- **Web App API Authentication**: Every `/api/v1/payments/*` call requires an API key (`Authorization: Bearer <key>`) generated from the dashboard Security tab (only its SHA-256 hash is stored) or provided via the `WEBAPP_API_KEY` secret. Optional HMAC request signing (`X-PP-Timestamp` / `X-PP-Signature`) can be enforced for replay and tamper protection. Administrative endpoints (mark-paid, config, logs, request inspector, emulator controls) are only reachable with a dashboard session.
- **Signed Webhooks to the Web App**: Every status notification is signed with a dedicated webhook secret (`X-PP-Signature: t=<ts>,v1=<hmac>`), carries an `X-PP-Event-Id` for idempotency, and is retried with backoff on failure.
- **Hardened Gateway Callback Handling**: Transactions are resolved from the processor's own records before any gateway verifier runs. AzamPay callbacks are verified with AzamPay's RSA public key (SHA-256 / PKCS#1 v1.5 over `utilityref + externalreference + transactionstatus + operator`); the key is fetched from `/azampay/v1/public-key`, cached for 24 hours and re-fetched once on a failed check. Signatures are compared in constant time; unsigned callbacks are never trusted directly but confirmed through the gateway status API, or, where the gateway offers no status API (AzamPay MNO checkout), accepted only when they quote the gateway reference issued at initiation with a matching amount and phone number. A "require signed callbacks" switch per environment rejects unsigned AzamPay callbacks outright. Amounts must match; completed payments are never downgraded; callbacks for unknown transactions are never forwarded.
- **Pending Transaction Lifespan**: A payment that stays `pending` longer than the configured lifespan (default 30 minutes, General Settings) is marked `failed` and the web app is notified. This runs on every status query and on a cron trigger every 5 minutes, so abandoned USSD prompts never stay pending for days. A late `success` callback from the gateway still upgrades such a payment to `success`.
- **Secret-Safe Logging**: Request and response bodies are redacted before storage (passwords, client secrets, tokens, signatures); login and configuration submissions are never stored.
- **Built-in Payment Emulator & Terminal (`/emulator`)**: Interactive terminal and sandbox to test payment initiation, USSD pushes, and webhooks without real credentials.

---

## Architecture Overview

```
┌───────────────────────────────┐
│   Client Application / WebApp │
└───────────────┬───────────────┘
                │ HTTP POST /api/v1/payments/initiate
                ▼
┌─────────────────────────────────────────────────────────────┐
│             Cloudflare Worker (Hono + JavaScript)           │
├───────────────────────────────┬─────────────────────────────┤
│  API Routes (`src/routes/`)   │  Admin Panel & Emulator UI  │
├───────────────────────────────┴─────────────────────────────┤
│  Gateway Drivers (`src/gateways/`)                          │
│  - SelcomGateway.js                                         │
│  - AzamPayGateway.js                                        │
└───────────────┬───────────────┴─────────────────────────────┘
                │                               │
                ▼                               ▼
    ┌───────────────────────┐       ┌──────────────────────┐
    │  Cloudflare D1 (SQL)  │       │  Selcom & AzamPay    │
    │  - configs            │       │  External Gateways   │
    │  - payment_logs       │       └──────────────────────┘
    │  - emulator_txns      │
    └───────────────────────┘
```

---

## Deployment & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development

```bash
npm run dev
```

### 3. Apply D1 Database Migration

```bash
npm run db:migrate:local
```

---

## API Endpoints Summary

- `POST /api/v1/payments/initiate` — Initiate a payment
- `GET /api/v1/payments/status/:external_reference` — Check payment status
- `POST /api/v1/callbacks/:gateway` — Webhook endpoint for gateways
- `GET /api/v1/config` & `POST /api/v1/config` — Retrieve / Update middleware configurations
- `GET /api/v1/logs` — Query transaction logs JSON

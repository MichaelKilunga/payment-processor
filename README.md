# Payment Processor Middleware (Cloudflare Workers + JavaScript)

A high-performance payment processor middleware built in pure JavaScript for **Cloudflare Workers**, **Hono**, and **Cloudflare D1**.

It acts as a standalone middleware service between your web application and mobile money payment gateways in Tanzania (**Selcom** and **AzamPay**).

---

## Features

- **Pure JavaScript & Cloudflare Workers**: Native V8 execution at global edge locations.
- **Selcom Gateway Driver**: Minimal Checkout API, HMAC SHA256 header generation, signature verification, and callback parsing.
- **AzamPay Gateway Driver**: Token generation, MNO checkout (USSD Push), automatic phone operator detection (Vodacom Mpesa, Tigo Pesa, Airtel Money, HaloPesa, AzamPesa), HMAC signature verification.
- **Serverless SQL Database (Cloudflare D1)**: Persistent storage for configurations, payment logs, and sandbox emulator transactions.
- **Admin Configuration Dashboard (`/`)**: Web UI to manage credentials, active gateway driver, webapp callback URL, live connection testing, and transaction log management with CSV/JSON exports.
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

-- Cloudflare D1 Database Schema for Payment Processor

CREATE TABLE IF NOT EXISTS configs (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_reference TEXT NOT NULL,
    gateway_reference TEXT,
    gateway TEXT NOT NULL,
    amount REAL NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    raw_request TEXT,
    raw_response TEXT,
    callback_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL,
    direction TEXT NOT NULL DEFAULT 'INBOUND', -- 'INBOUND' (Web App -> Processor) or 'OUTBOUND' (Processor -> Gateway/WebApp)
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER,
    headers TEXT,
    request_body TEXT,
    response_body TEXT,
    ip_address TEXT,
    duration_ms INTEGER,
    external_reference TEXT,
    gateway TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emulator_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gateway TEXT NOT NULL,
    external_id TEXT NOT NULL,
    amount REAL NOT NULL,
    phone TEXT NOT NULL,
    buyer_name TEXT,
    buyer_email TEXT,
    status TEXT DEFAULT 'pending',
    raw_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_ext_ref ON payment_logs(external_reference);
CREATE INDEX IF NOT EXISTS idx_payment_logs_gateway ON payment_logs(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);

CREATE INDEX IF NOT EXISTS idx_req_logs_req_id ON request_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_req_logs_dir ON request_logs(direction);
CREATE INDEX IF NOT EXISTS idx_req_logs_ext_ref ON request_logs(external_reference);
CREATE INDEX IF NOT EXISTS idx_req_logs_created ON request_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_emulator_txns_ext_id ON emulator_transactions(external_id);

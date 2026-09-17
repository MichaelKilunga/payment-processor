<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payment Emulator — Sandbox</title>
    <meta name="description" content="Simulated payment gateway emulator for testing Selcom and AzamPay payment flows end-to-end without real credentials." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />

    <style>
        /* ─── Design Tokens ─────────────────────────────────────── */
        :root {
            --bg:           #0d0f17;
            --bg-card:      #13161f;
            --bg-elevated:  #1a1d2a;
            --border:       rgba(255,255,255,0.07);
            --border-glow:  rgba(99,179,237,0.25);
            --text:         #e8ecf4;
            --text-muted:   #7a84a0;
            --text-dim:     #4a5270;
            --primary:      #63b3ed;
            --primary-dark: #3a86c8;
            --success:      #48d890;
            --success-bg:   rgba(72,216,144,0.10);
            --danger:       #fc6c6c;
            --danger-bg:    rgba(252,108,108,0.10);
            --warning:      #fbbf24;
            --warning-bg:   rgba(251,191,36,0.10);
            --selcom:       #00c6a2;
            --azampay:      #7c5cbf;
            --radius:       14px;
            --radius-sm:    8px;
            --shadow:       0 8px 32px rgba(0,0,0,0.45);
        }

        /* ─── Reset ─────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ─── Ambient Glow Background ────────────────────────────── */
        body::before {
            content: '';
            position: fixed;
            top: -200px; left: 50%;
            transform: translateX(-50%);
            width: 900px; height: 600px;
            background: radial-gradient(ellipse at center,
                rgba(99,179,237,0.06) 0%,
                rgba(124,92,191,0.04) 50%,
                transparent 70%);
            pointer-events: none;
            z-index: 0;
        }

        /* ─── Header ─────────────────────────────────────────────── */
        .header {
            position: sticky; top: 0; z-index: 100;
            background: rgba(13,15,23,0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            padding: 0 32px;
            display: flex; align-items: center; justify-content: space-between;
            height: 64px;
        }
        .header-brand {
            display: flex; align-items: center; gap: 12px;
        }
        .header-icon {
            width: 36px; height: 36px;
            background: linear-gradient(135deg, var(--primary), var(--azampay));
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px;
        }
        .header-title { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
        .header-sub   { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
        .header-badge {
            background: rgba(72,216,144,0.15);
            color: var(--success);
            border: 1px solid rgba(72,216,144,0.25);
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            display: flex; align-items: center; gap: 6px;
        }
        .pulse-dot {
            width: 7px; height: 7px;
            border-radius: 50%;
            background: var(--success);
            animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.4; transform: scale(0.75); }
        }

        /* ─── Layout ─────────────────────────────────────────────── */
        .layout {
            position: relative; z-index: 1;
            max-width: 1400px; margin: 0 auto;
            padding: 28px 24px;
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 24px;
            align-items: start;
        }
        @media (max-width: 960px) {
            .layout { grid-template-columns: 1fr; }
        }

        /* ─── Cards ──────────────────────────────────────────────── */
        .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
        }
        .card-header {
            padding: 18px 22px 16px;
            border-bottom: 1px solid var(--border);
            display: flex; align-items: center; justify-content: space-between;
        }
        .card-title {
            font-size: 13px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 1px;
            color: var(--text-muted);
        }
        .card-body { padding: 20px 22px; }

        /* ─── Form ───────────────────────────────────────────────── */
        .form-group { margin-bottom: 16px; }
        .form-label {
            display: block;
            font-size: 12px; font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 7px;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        .form-control {
            width: 100%;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            color: var(--text);
            font-family: inherit; font-size: 14px;
            padding: 10px 14px;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
        }
        .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99,179,237,0.12);
        }
        .form-control::placeholder { color: var(--text-dim); }

        /* Gateway selector */
        .gateway-tabs {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 10px; margin-bottom: 20px;
        }
        .gateway-tab {
            background: var(--bg-elevated);
            border: 2px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 14px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
            user-select: none;
        }
        .gateway-tab:hover { border-color: rgba(255,255,255,0.15); }
        .gateway-tab.active-selcom {
            border-color: var(--selcom);
            background: rgba(0,198,162,0.08);
            box-shadow: 0 0 20px rgba(0,198,162,0.15);
        }
        .gateway-tab.active-azampay {
            border-color: var(--azampay);
            background: rgba(124,92,191,0.1);
            box-shadow: 0 0 20px rgba(124,92,191,0.18);
        }
        .gateway-tab-icon { font-size: 22px; margin-bottom: 6px; }
        .gateway-tab-name { font-size: 13px; font-weight: 700; }
        .gateway-tab-type { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        /* Buttons */
        .btn {
            display: inline-flex; align-items: center; justify-content: center;
            gap: 8px;
            padding: 11px 20px;
            border-radius: var(--radius-sm);
            font-family: inherit; font-size: 14px; font-weight: 600;
            border: none; cursor: pointer;
            transition: all 0.2s; outline: none;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: #fff;
            width: 100%;
        }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,179,237,0.3); }
        .btn-primary:active { transform: translateY(0); }
        .btn-success {
            background: var(--success-bg); color: var(--success);
            border: 1px solid rgba(72,216,144,0.3);
            padding: 7px 14px; font-size: 12px;
        }
        .btn-success:hover { background: rgba(72,216,144,0.2); }
        .btn-danger {
            background: var(--danger-bg); color: var(--danger);
            border: 1px solid rgba(252,108,108,0.3);
            padding: 7px 14px; font-size: 12px;
        }
        .btn-danger:hover { background: rgba(252,108,108,0.2); }
        .btn-warning {
            background: var(--warning-bg); color: var(--warning);
            border: 1px solid rgba(251,191,36,0.3);
            padding: 7px 14px; font-size: 12px;
        }
        .btn-warning:hover { background: rgba(251,191,36,0.2); }
        .btn-sm { padding: 6px 12px; font-size: 11px; }

        /* ─── Alert / Toast ──────────────────────────────────────── */
        #toast {
            position: fixed; bottom: 24px; right: 24px; z-index: 9999;
            max-width: 360px;
            padding: 14px 20px;
            border-radius: var(--radius-sm);
            font-size: 13px; font-weight: 500;
            display: none;
            animation: slideIn 0.3s ease;
            box-shadow: var(--shadow);
        }
        #toast.success { background: rgba(18,32,24,0.98); border: 1px solid rgba(72,216,144,0.35); color: var(--success); }
        #toast.error   { background: rgba(30,14,14,0.98); border: 1px solid rgba(252,108,108,0.35); color: var(--danger); }
        #toast.info    { background: rgba(10,22,36,0.98); border: 1px solid rgba(99,179,237,0.35); color: var(--primary); }
        @keyframes slideIn {
            from { transform: translateX(120%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
        }

        /* ─── Transaction Queue ──────────────────────────────────── */
        .tx-list { display: flex; flex-direction: column; gap: 12px; }

        .tx-card {
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 16px;
            display: flex; flex-direction: column; gap: 12px;
            transition: border-color 0.2s, box-shadow 0.2s;
            animation: fadeIn 0.3s ease;
        }
        .tx-card:hover { border-color: rgba(255,255,255,0.12); }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .tx-card.gateway-selcom  { border-left: 3px solid var(--selcom); }
        .tx-card.gateway-azampay { border-left: 3px solid var(--azampay); }

        .tx-header { display: flex; align-items: center; justify-content: space-between; }
        .tx-gateway-badge {
            font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
            padding: 3px 10px; border-radius: 99px;
        }
        .tx-gateway-badge.selcom  { background: rgba(0,198,162,0.12); color: var(--selcom); }
        .tx-gateway-badge.azampay { background: rgba(124,92,191,0.15); color: #a78bfa; }

        .tx-status {
            font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px;
        }
        .tx-status.pending  { background: var(--warning-bg);  color: var(--warning); }
        .tx-status.approved { background: var(--success-bg);  color: var(--success); }
        .tx-status.rejected { background: var(--danger-bg);   color: var(--danger);  }
        .tx-status.timeout  { background: rgba(100,100,100,0.1); color: var(--text-dim); }

        .tx-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
        .tx-detail  { display: flex; flex-direction: column; gap: 2px; }
        .tx-detail-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }
        .tx-detail-value { font-size: 13px; font-weight: 500; font-family: 'JetBrains Mono', monospace; }

        .tx-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        /* ─── Stats Bar ──────────────────────────────────────────── */
        .stats-bar {
            display: grid; grid-template-columns: repeat(4, 1fr);
            gap: 1px;
            background: var(--border);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            overflow: hidden;
            margin-bottom: 20px;
        }
        .stat-item {
            background: var(--bg-elevated);
            padding: 14px 16px;
            text-align: center;
        }
        .stat-value { font-size: 22px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
        .stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .stat-pending  .stat-value { color: var(--warning); }
        .stat-approved .stat-value { color: var(--success); }
        .stat-rejected .stat-value { color: var(--danger); }
        .stat-total    .stat-value { color: var(--primary); }

        /* ─── Filter Bar ─────────────────────────────────────────── */
        .filter-bar {
            display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;
        }
        .filter-btn {
            padding: 6px 14px; border-radius: 99px;
            font-size: 12px; font-weight: 600; cursor: pointer;
            border: 1px solid var(--border);
            background: transparent; color: var(--text-muted);
            transition: all 0.2s;
        }
        .filter-btn:hover, .filter-btn.active {
            background: var(--bg-elevated);
            color: var(--text);
            border-color: rgba(255,255,255,0.2);
        }
        .filter-btn.active { color: var(--primary); border-color: var(--primary); }
        .filter-spacer { flex: 1; }
        .auto-refresh-label { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .toggle-switch {
            width: 36px; height: 20px;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 99px;
            cursor: pointer;
            position: relative;
            transition: background 0.2s;
        }
        .toggle-switch.on { background: var(--primary); border-color: var(--primary); }
        .toggle-thumb {
            position: absolute; top: 2px; left: 2px;
            width: 14px; height: 14px;
            background: #fff; border-radius: 50%;
            transition: left 0.2s;
        }
        .toggle-switch.on .toggle-thumb { left: 18px; }

        /* ─── Empty State ────────────────────────────────────────── */
        .empty-state {
            padding: 60px 20px; text-align: center;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
        .empty-title { font-size: 16px; font-weight: 600; color: var(--text-muted); }
        .empty-sub   { font-size: 13px; color: var(--text-dim); margin-top: 6px; }

        /* ─── Right Panel Sticky ─────────────────────────────────── */
        .right-panel { position: sticky; top: 80px; }

        /* ─── API Info Box ───────────────────────────────────────── */
        .api-info {
            margin-top: 20px;
        }
        .api-block {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 14px 16px;
            margin-bottom: 10px;
        }
        .api-block-title { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .api-url {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px; color: var(--primary);
            word-break: break-all;
        }
        .api-method {
            display: inline-block;
            font-size: 9px; font-weight: 700; letter-spacing: 1px;
            padding: 1px 7px; border-radius: 4px;
            background: rgba(99,179,237,0.12); color: var(--primary);
            margin-right: 6px;
        }

        /* ─── Scrollable tx list ─────────────────────────────────── */
        .tx-scroll {
            max-height: calc(100vh - 260px);
            overflow-y: auto;
            padding-right: 4px;
        }
        .tx-scroll::-webkit-scrollbar { width: 4px; }
        .tx-scroll::-webkit-scrollbar-track { background: transparent; }
        .tx-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        /* ─── Loading shimmer ────────────────────────────────────── */
        .shimmer {
            background: linear-gradient(90deg, var(--bg-elevated) 25%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: var(--radius-sm);
            height: 80px;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ─── Selcom Pay Page ────────────────────────────────────── */
        .pay-page-overlay {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            display: none;
            align-items: center; justify-content: center;
        }
        .pay-page-overlay.open { display: flex; }
        .pay-page-modal {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 36px;
            max-width: 420px; width: 100%;
            text-align: center;
            box-shadow: var(--shadow);
        }
        .pay-page-icon { font-size: 48px; margin-bottom: 12px; }
        .pay-page-title { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
        .pay-page-amount { font-size: 36px; font-weight: 800; color: var(--selcom); font-family: 'JetBrains Mono', monospace; margin: 16px 0; }
        .pay-page-phone { font-size: 15px; color: var(--text-muted); margin-bottom: 24px; }
        .pay-page-actions { display: flex; gap: 12px; }
        .pay-page-actions .btn { flex: 1; }
    </style>
</head>
<body>

<!-- ─── Header ───────────────────────────────────────────────────── -->
<header class="header">
    <div class="header-brand">
        <div class="header-icon">🧪</div>
        <div>
            <div class="header-title">Payment Emulator</div>
            <div class="header-sub">Sandbox Gateway Simulator</div>
        </div>
    </div>
    <div class="header-badge">
        <div class="pulse-dot"></div>
        SANDBOX ACTIVE
    </div>
</header>

<!-- ─── Main Layout ───────────────────────────────────────────────── -->
<main class="layout">

    <!-- ─── LEFT: Initiate Test Payment ───────────────────────────── -->
    <aside>
        <div class="card">
            <div class="card-header">
                <span class="card-title">⚡ Initiate Test Payment</span>
            </div>
            <div class="card-body">
                <!-- Gateway selector -->
                <div class="form-group">
                    <label class="form-label">Select Gateway</label>
                    <div class="gateway-tabs">
                        <div class="gateway-tab active-selcom" id="tab-selcom" onclick="selectGateway('selcom')">
                            <div class="gateway-tab-icon">🏦</div>
                            <div class="gateway-tab-name" style="color: var(--selcom)">Selcom</div>
                            <div class="gateway-tab-type">Checkout URL</div>
                        </div>
                        <div class="gateway-tab" id="tab-azampay" onclick="selectGateway('azampay')">
                            <div class="gateway-tab-icon">📲</div>
                            <div class="gateway-tab-name" style="color: #a78bfa">AzamPay</div>
                            <div class="gateway-tab-type">USSD Push</div>
                        </div>
                    </div>
                </div>

                <form id="initiateForm" onsubmit="initiatePayment(event)">
                    <input type="hidden" id="gateway" value="selcom" />

                    <div class="form-group">
                        <label class="form-label" for="amount">Amount (TZS)</label>
                        <input class="form-control" type="number" id="amount" placeholder="e.g. 5000" min="1" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="phone">Phone Number</label>
                        <input class="form-control" type="text" id="phone" placeholder="e.g. 0712345678" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="external_reference">External Reference</label>
                        <input class="form-control" type="text" id="external_reference" placeholder="e.g. ORDER-2026-001" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="name">Customer Name <span style="color:var(--text-dim)">(optional)</span></label>
                        <input class="form-control" type="text" id="name" placeholder="e.g. John Doe" />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="email">Email <span style="color:var(--text-dim)">(optional)</span></label>
                        <input class="form-control" type="email" id="email" placeholder="e.g. john@example.com" />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="remarks">Remarks <span style="color:var(--text-dim)">(optional)</span></label>
                        <input class="form-control" type="text" id="remarks" placeholder="e.g. Invoice #1234" />
                    </div>

                    <button type="submit" class="btn btn-primary" id="submitBtn">
                        <span id="submitIcon">⚡</span>
                        <span id="submitText">Send Payment Request</span>
                    </button>
                </form>
            </div>
        </div>

        <!-- API Info -->
        <div class="api-info">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">🔌 Emulator Endpoints</span>
                </div>
                <div class="card-body" style="padding-top:14px;">
                    <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">
                        Point your processor config to these URLs instead of real gateways:
                    </p>
                    <div class="api-block">
                        <div class="api-block-title">🟢 AzamPay Auth Base URL</div>
                        <div class="api-url"><span class="api-method">POST</span>{{ url('/api/emulator/azampay') }}</div>
                    </div>
                    <div class="api-block">
                        <div class="api-block-title">🟢 AzamPay Base URL</div>
                        <div class="api-url"><span class="api-method">POST</span>{{ url('/api/emulator/azampay') }}</div>
                    </div>
                    <div class="api-block">
                        <div class="api-block-title">🏦 Selcom Base URL</div>
                        <div class="api-url"><span class="api-method">POST</span>{{ url('/api/emulator/selcom') }}</div>
                    </div>
                    <div class="api-block">
                        <div class="api-block-title">📤 Processor Initiate</div>
                        <div class="api-url"><span class="api-method">POST</span>{{ url('/api/v1/payments/initiate') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </aside>

    <!-- ─── RIGHT: Transaction Queue ──────────────────────────────── -->
    <section>
        <div class="card right-panel">
            <div class="card-header">
                <span class="card-title">📋 Transaction Queue</span>
                <button class="btn btn-success btn-sm" onclick="loadTransactions()" id="refreshBtn">↻ Refresh</button>
            </div>
            <div class="card-body">

                <!-- Stats -->
                <div class="stats-bar" id="statsBar">
                    <div class="stat-item stat-pending">
                        <div class="stat-value" id="stat-pending">—</div>
                        <div class="stat-label">Pending</div>
                    </div>
                    <div class="stat-item stat-approved">
                        <div class="stat-value" id="stat-approved">—</div>
                        <div class="stat-label">Approved</div>
                    </div>
                    <div class="stat-item stat-rejected">
                        <div class="stat-value" id="stat-rejected">—</div>
                        <div class="stat-label">Rejected</div>
                    </div>
                    <div class="stat-item stat-total">
                        <div class="stat-value" id="stat-total">—</div>
                        <div class="stat-label">Total</div>
                    </div>
                </div>

                <!-- Filter + Auto-refresh -->
                <div class="filter-bar">
                    <button class="filter-btn active" data-filter="all"      onclick="setFilter('all', this)">All</button>
                    <button class="filter-btn"        data-filter="pending"  onclick="setFilter('pending', this)">⏳ Pending</button>
                    <button class="filter-btn"        data-filter="approved" onclick="setFilter('approved', this)">✅ Approved</button>
                    <button class="filter-btn"        data-filter="rejected" onclick="setFilter('rejected', this)">❌ Rejected</button>
                    <button class="filter-btn"        data-filter="selcom"   onclick="setFilter('selcom', this)">Selcom</button>
                    <button class="filter-btn"        data-filter="azampay"  onclick="setFilter('azampay', this)">AzamPay</button>
                    <div class="filter-spacer"></div>
                    <label class="auto-refresh-label">
                        Auto
                        <div class="toggle-switch on" id="autoRefreshToggle" onclick="toggleAutoRefresh()">
                            <div class="toggle-thumb"></div>
                        </div>
                    </label>
                </div>

                <!-- Transaction List -->
                <div class="tx-scroll">
                    <div class="tx-list" id="txList">
                        <div class="shimmer"></div>
                        <div class="shimmer" style="height:60px;margin-top:4px;opacity:0.5"></div>
                    </div>
                </div>

            </div>
        </div>
    </section>

</main>

<!-- ─── Toast ─────────────────────────────────────────────────────── -->
<div id="toast"></div>

<script>
/* ─── State ───────────────────────────────────────────────────────── */
let allTransactions = [];
let currentFilter   = 'all';
let autoRefresh     = true;
let refreshTimer    = null;
const REFRESH_MS    = 3000;

/* ─── Gateway Selection ───────────────────────────────────────────── */
function selectGateway(gw) {
    document.getElementById('gateway').value = gw;
    document.getElementById('tab-selcom').className  = gw === 'selcom'  ? 'gateway-tab active-selcom'  : 'gateway-tab';
    document.getElementById('tab-azampay').className = gw === 'azampay' ? 'gateway-tab active-azampay' : 'gateway-tab';
}

/* ─── Initiate Payment ────────────────────────────────────────────── */
async function initiatePayment(e) {
    e.preventDefault();

    const btn      = document.getElementById('submitBtn');
    const iconEl   = document.getElementById('submitIcon');
    const textEl   = document.getElementById('submitText');
    btn.disabled   = true;
    iconEl.textContent = '⏳';
    textEl.textContent = 'Sending…';

    const payload = {
        gateway:            document.getElementById('gateway').value,
        amount:             document.getElementById('amount').value,
        phone:              document.getElementById('phone').value,
        external_reference: document.getElementById('external_reference').value,
        name:               document.getElementById('name').value  || undefined,
        email:              document.getElementById('email').value || undefined,
        remarks:            document.getElementById('remarks').value || undefined,
    };

    // Remove undefined keys
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    try {
        const res = await fetch('/api/v1/payments/initiate', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:    JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
            showToast('success', '✅ Payment initiated! Check the queue →');
            // Auto-open Selcom checkout URL in new tab
            if (payload.gateway === 'selcom' && data.payment_url) {
                window.open(data.payment_url, '_blank');
                showToast('info', '🏦 Selcom checkout page opened in a new tab.');
            }
            loadTransactions();
            // Reset ref field
            document.getElementById('external_reference').value = 'ORDER-' + Date.now();
        } else {
            showToast('error', '❌ ' + (data.message || 'Initiation failed'));
        }
    } catch (err) {
        showToast('error', '❌ Network error: ' + err.message);
    } finally {
        btn.disabled = false;
        iconEl.textContent = '⚡';
        textEl.textContent = 'Send Payment Request';
    }
}

/* ─── Load Transactions ───────────────────────────────────────────── */
async function loadTransactions() {
    try {
        const res  = await fetch('/api/emulator/transactions', { headers: { 'Accept': 'application/json' } });
        allTransactions = await res.json();
        renderTransactions();
        updateStats();
    } catch (err) {
        console.error('Failed to load transactions:', err);
    }
}

/* ─── Render Transactions ─────────────────────────────────────────── */
function renderTransactions() {
    const list = document.getElementById('txList');
    let txs    = allTransactions;

    if (currentFilter === 'pending' || currentFilter === 'approved' || currentFilter === 'rejected' || currentFilter === 'timeout') {
        txs = txs.filter(t => t.status === currentFilter);
    } else if (currentFilter === 'selcom' || currentFilter === 'azampay') {
        txs = txs.filter(t => t.gateway === currentFilter);
    }

    if (txs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔇</div>
                <div class="empty-title">No transactions yet</div>
                <div class="empty-sub">Initiate a payment to see it appear here.</div>
            </div>`;
        return;
    }

    list.innerHTML = txs.map(tx => {
        const isPending = tx.status === 'pending';
        const timeAgo   = formatTimeAgo(tx.created_at);
        const amount    = Number(tx.amount).toLocaleString('en-TZ');

        return `
        <div class="tx-card gateway-${tx.gateway}" id="tx-${tx.id}">
            <div class="tx-header">
                <span class="tx-gateway-badge ${tx.gateway}">${tx.gateway.toUpperCase()}</span>
                <span class="tx-status ${tx.status}">${statusLabel(tx.status)}</span>
            </div>
            <div class="tx-details">
                <div class="tx-detail">
                    <span class="tx-detail-label">Amount</span>
                    <span class="tx-detail-value">TZS ${amount}</span>
                </div>
                <div class="tx-detail">
                    <span class="tx-detail-label">Phone</span>
                    <span class="tx-detail-value">${tx.phone}</span>
                </div>
                <div class="tx-detail">
                    <span class="tx-detail-label">Reference</span>
                    <span class="tx-detail-value" style="font-size:11px">${tx.external_id}</span>
                </div>
                <div class="tx-detail">
                    <span class="tx-detail-label">Created</span>
                    <span class="tx-detail-value" style="font-size:11px;color:var(--text-muted)">${timeAgo}</span>
                </div>
                ${tx.buyer_name ? `
                <div class="tx-detail">
                    <span class="tx-detail-label">Customer</span>
                    <span class="tx-detail-value" style="font-size:12px">${tx.buyer_name}</span>
                </div>` : ''}
            </div>
            ${isPending ? `
            <div class="tx-actions">
                <button class="btn btn-success" onclick="resolve(${tx.id}, 'approve')" id="btn-approve-${tx.id}">
                    ✅ Approve
                </button>
                <button class="btn btn-danger"  onclick="resolve(${tx.id}, 'reject')"  id="btn-reject-${tx.id}">
                    ❌ Reject
                </button>
                <button class="btn btn-warning" onclick="resolve(${tx.id}, 'timeout')" id="btn-timeout-${tx.id}">
                    ⏱ Timeout
                </button>
            </div>` : ''}
        </div>`;
    }).join('');
}

/* ─── Resolve ─────────────────────────────────────────────────────── */
async function resolve(id, action) {
    // Disable all action buttons for this tx
    ['approve','reject','timeout'].forEach(a => {
        const el = document.getElementById(`btn-${a}-${id}`);
        if (el) { el.disabled = true; el.style.opacity = '0.5'; }
    });

    try {
        const res  = await fetch(`/api/emulator/resolve/${id}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json',
                       'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
            body:    JSON.stringify({ action }),
        });
        const data = await res.json();

        if (data.success) {
            const labels = { approve: '✅ Approved', reject: '❌ Rejected', timeout: '⏱ Timed out' };
            showToast('success', `${labels[action]} — callback fired to processor!`);
            await loadTransactions();
        } else {
            showToast('error', data.error || 'Failed to resolve transaction.');
        }
    } catch (err) {
        showToast('error', '❌ ' + err.message);
    }
}

/* ─── Stats ───────────────────────────────────────────────────────── */
function updateStats() {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    allTransactions.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });
    document.getElementById('stat-pending').textContent  = counts.pending;
    document.getElementById('stat-approved').textContent = counts.approved;
    document.getElementById('stat-rejected').textContent = counts.rejected;
    document.getElementById('stat-total').textContent    = allTransactions.length;
}

/* ─── Filter ──────────────────────────────────────────────────────── */
function setFilter(filter, el) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderTransactions();
}

/* ─── Auto-Refresh ────────────────────────────────────────────────── */
function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    const toggle = document.getElementById('autoRefreshToggle');
    toggle.classList.toggle('on', autoRefresh);
    if (autoRefresh) startAutoRefresh();
    else clearTimeout(refreshTimer);
}
function startAutoRefresh() {
    clearTimeout(refreshTimer);
    if (autoRefresh) {
        refreshTimer = setTimeout(async () => {
            await loadTransactions();
            startAutoRefresh();
        }, REFRESH_MS);
    }
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
function statusLabel(s) {
    return { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected', timeout: '⏱ Timeout' }[s] || s;
}

function formatTimeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
}

function showToast(type, msg) {
    const t = document.getElementById('toast');
    t.className = type;
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.display = 'none'; }, 4000);
}

/* ─── Init ────────────────────────────────────────────────────────── */
// Pre-fill a reference
document.getElementById('external_reference').value = 'ORDER-' + Date.now();

loadTransactions();
startAutoRefresh();
</script>

<!-- CSRF meta tag for AJAX requests -->
<meta name="csrf-token" content="{{ csrf_token() }}" />
</body>
</html>

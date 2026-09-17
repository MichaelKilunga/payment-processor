<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Selcom Checkout — Emulator</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet" />
    <style>
        :root {
            --selcom: #00c6a2;
            --selcom-dark: #009e82;
            --bg: #0b1419;
            --card: #111c23;
            --border: rgba(255,255,255,0.08);
            --text: #e8ecf4;
            --muted: #7a90a0;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 24px;
        }
        body::before {
            content: '';
            position: fixed; top: 0; left: 0; right: 0; height: 300px;
            background: linear-gradient(180deg, rgba(0,198,162,0.08) 0%, transparent 100%);
            pointer-events: none;
        }
        .page-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 20px;
            max-width: 440px; width: 100%;
            overflow: hidden;
            box-shadow: 0 16px 64px rgba(0,0,0,0.5);
            position: relative;
        }
        .page-header {
            background: linear-gradient(135deg, #00c6a2, #007d68);
            padding: 28px 28px 24px;
            text-align: center;
        }
        .page-logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; color: #fff; }
        .page-logo span { color: rgba(255,255,255,0.6); }
        .page-header-sub { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px; }
        .page-body { padding: 28px; }
        .merchant-name { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .amount-display {
            font-family: 'JetBrains Mono', monospace;
            font-size: 40px; font-weight: 700;
            color: var(--selcom);
            margin-bottom: 4px;
        }
        .amount-label { font-size: 12px; color: var(--muted); margin-bottom: 20px; }
        .info-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
        }
        .info-row:last-of-type { border-bottom: none; }
        .info-label { color: var(--muted); }
        .info-value { font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
        .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        .action-group { display: flex; flex-direction: column; gap: 10px; }
        .btn {
            width: 100%; padding: 14px; border-radius: 10px;
            font-family: inherit; font-size: 14px; font-weight: 700;
            border: none; cursor: pointer; transition: all 0.2s;
        }
        .btn-pay {
            background: linear-gradient(135deg, var(--selcom), var(--selcom-dark));
            color: #fff;
        }
        .btn-pay:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-cancel {
            background: rgba(255,255,255,0.04); color: var(--muted);
            border: 1px solid var(--border);
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.08); color: var(--text); }
        .secure-badge {
            text-align: center; font-size: 11px; color: var(--muted);
            margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .status-overlay {
            position: fixed; inset: 0; z-index: 999;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);
            display: none; align-items: center; justify-content: center;
        }
        .status-box {
            text-align: center; padding: 40px;
        }
        .status-icon { font-size: 64px; margin-bottom: 16px; }
        .status-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
        .status-msg { font-size: 14px; color: var(--muted); }
        .spinner {
            width: 40px; height: 40px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: var(--selcom);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .emulator-notice {
            background: rgba(0,198,162,0.06);
            border: 1px solid rgba(0,198,162,0.2);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 11px;
            color: rgba(0,198,162,0.8);
            margin-bottom: 20px;
        }
    </style>
</head>
<body>

<div class="page-card">
    <div class="page-header">
        <div class="page-logo">Sel<span>com</span></div>
        <div class="page-header-sub">Secure Payment Gateway</div>
    </div>
    <div class="page-body">

        <div class="emulator-notice">
            🧪 <strong>Emulator Mode</strong> — This is a simulated Selcom checkout page.
            Use the Approve/Reject buttons below to simulate customer action.
        </div>

        <div class="merchant-name">Amount Due</div>
        <div class="amount-display">
            TZS {{ number_format($transaction?->amount ?? 0, 0) }}
        </div>
        <div class="amount-label">Tanzanian Shillings</div>

        <div class="info-row">
            <span class="info-label">Order Reference</span>
            <span class="info-value">{{ $orderId }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Customer</span>
            <span class="info-value">{{ $transaction?->buyer_name ?? 'Customer' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">{{ $transaction?->phone ?? '—' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color: {{ $transaction?->status === 'approved' ? '#00c6a2' : ($transaction?->status === 'rejected' ? '#fc6c6c' : '#fbbf24') }}">
                {{ strtoupper($transaction?->status ?? 'UNKNOWN') }}
            </span>
        </div>

        <hr class="divider" />

        @if(($transaction?->status ?? 'pending') === 'pending')
            <div class="action-group">
                <button class="btn btn-pay" onclick="handleAction('approve')">
                    ✅ Confirm & Pay
                </button>
                <button class="btn btn-cancel" onclick="handleAction('reject')">
                    ✗ Cancel Payment
                </button>
            </div>
        @else
            <div style="text-align:center;padding:20px 0;font-size:16px;font-weight:600;color:var(--muted)">
                This transaction has already been {{ $transaction?->status ?? 'processed' }}.
            </div>
        @endif

        <div class="secure-badge">
            🔒 256-bit SSL Encrypted • Emulator Sandbox
        </div>
    </div>
</div>

<!-- Processing overlay -->
<div class="status-overlay" id="overlay">
    <div class="status-box" id="overlayContent">
        <div class="spinner"></div>
        <div class="status-title">Processing…</div>
        <div class="status-msg">Please wait while we confirm your payment.</div>
    </div>
</div>

<script>
async function handleAction(action) {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';

    try {
        const txId = {{ $transaction?->id ?? 'null' }};
        if (!txId) {
            showResult('error', '❌', 'Transaction Not Found', 'Could not find this transaction in the emulator.');
            return;
        }

        const res = await fetch(`/api/emulator/resolve/${txId}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:    JSON.stringify({ action }),
        });
        const data = await res.json();

        if (data.success) {
            if (action === 'approve') {
                showResult('success', '✅', 'Payment Successful!', 'Your payment has been confirmed. You may close this tab.');
            } else {
                showResult('cancelled', '❌', 'Payment Cancelled', 'You cancelled this payment. You may close this tab.');
            }
        } else {
            showResult('error', '⚠️', 'Error', data.error || 'An error occurred.');
        }
    } catch (err) {
        showResult('error', '⚠️', 'Network Error', err.message);
    }
}

function showResult(type, icon, title, msg) {
    const colors = { success: '#00c6a2', cancelled: '#fc6c6c', error: '#fbbf24' };
    document.getElementById('overlayContent').innerHTML = `
        <div class="status-icon">${icon}</div>
        <div class="status-title" style="color:${colors[type] || '#fff'}">${title}</div>
        <div class="status-msg">${msg}</div>
    `;
}
</script>

</body>
</html>

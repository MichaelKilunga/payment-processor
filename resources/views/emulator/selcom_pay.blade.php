<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Selcom Secure Checkout — Gateway Simulator</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />

    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @endif

    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 antialiased">

    <!-- Background Ambient Shield -->
    <div class="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950"></div>

    <!-- Main Checkout Modal Card -->
    <div class="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center text-white relative">
            <div class="flex items-center justify-center space-x-2">
                <svg class="w-7 h-7 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" />
                </svg>
                <span class="text-2xl font-extrabold tracking-tight">Selcom<span class="text-emerald-200 font-normal">Pay</span></span>
            </div>
            <p class="text-xs text-emerald-100/80 mt-1 font-medium">Enterprise Mobile Money Checkout</p>
        </div>

        <!-- Body Content -->
        <div class="p-6 space-y-6">
            
            <!-- Sandbox Notice -->
            <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                <svg class="w-4 h-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span><strong>Sandbox Simulator Mode</strong> — Simulate customer payment authorization below.</span>
            </div>

            <!-- Amount Display Card -->
            <div class="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <span class="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">Total Amount Due</span>
                <div class="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
                    TZS {{ number_format($transaction?->amount ?? 0, 0) }}
                </div>
                <span class="text-xs text-slate-500 mt-1 block">Tanzanian Shillings</span>
            </div>

            <!-- Order Details Table -->
            <div class="space-y-2 text-xs font-mono border-t border-b border-slate-800 py-4">
                <div class="flex justify-between items-center text-slate-400">
                    <span>Order Reference</span>
                    <span class="text-white font-bold">{{ $orderId }}</span>
                </div>
                <div class="flex justify-between items-center text-slate-400">
                    <span>Customer Name</span>
                    <span class="text-white font-bold">{{ $transaction?->buyer_name ?? 'Customer' }}</span>
                </div>
                <div class="flex justify-between items-center text-slate-400">
                    <span>Phone Number</span>
                    <span class="text-white font-bold">{{ $transaction?->phone ?? '—' }}</span>
                </div>
                <div class="flex justify-between items-center text-slate-400">
                    <span>Status</span>
                    <span class="font-bold px-2 py-0.5 rounded text-[11px] {{ ($transaction?->status ?? 'pending') === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : (($transaction?->status ?? 'pending') === 'rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400') }}">
                        {{ strtoupper($transaction?->status ?? 'PENDING') }}
                    </span>
                </div>
            </div>

            <!-- Action Buttons -->
            @if(($transaction?->status ?? 'pending') === 'pending')
                <div class="space-y-3">
                    <button type="button" 
                            onclick="handleAction('approve')" 
                            class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>Confirm & Authorize Payment</span>
                    </button>

                    <button type="button" 
                            onclick="handleAction('reject')" 
                            class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700 flex items-center justify-center space-x-2">
                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancel Payment Request</span>
                    </button>
                </div>
            @else
                <div class="text-center py-3 text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    This order has already been <strong class="text-white">{{ $transaction?->status ?? 'processed' }}</strong>.
                </div>
            @endif

            <!-- Security Footer -->
            <div class="text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5 pt-2">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>256-Bit SSL Encrypted &bull; Selcom Gateway Simulator</span>
            </div>

        </div>

    </div>

    <!-- Processing Overlay Dialog -->
    <div id="overlay" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl" id="overlayContent">
            <div class="w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
            <h3 class="text-lg font-bold text-white">Processing Payment…</h3>
            <p class="text-xs text-slate-400">Verifying customer credentials with Selcom Gateway.</p>
        </div>
    </div>

    <script>
        async function handleAction(action) {
            const overlay = document.getElementById('overlay');
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');

            try {
                const txId = {{ $transaction?->id ?? 'null' }};
                if (!txId) {
                    showResult('error', 'Transaction Not Found', 'Could not locate transaction record.');
                    return;
                }

                const res = await fetch(`/api/emulator/resolve/${txId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ action }),
                });
                const data = await res.json();

                if (data.success) {
                    if (action === 'approve') {
                        showResult('success', 'Payment Successful', 'Payment confirmed. Callback webhook sent to processor.');
                    } else {
                        showResult('cancelled', 'Payment Cancelled', 'You cancelled this payment order.');
                    }
                } else {
                    showResult('error', 'Error Processing', data.error || 'Failed resolving payment.');
                }
            } catch (err) {
                showResult('error', 'Network Error', err.message);
            }
        }

        function showResult(type, title, msg) {
            const isSuccess = type === 'success';
            document.getElementById('overlayContent').innerHTML = `
                <div class="w-12 h-12 rounded-2xl ${isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'} flex items-center justify-center mx-auto">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                        ${isSuccess ? '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />' : '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />'}
                    </svg>
                </div>
                <h3 class="text-lg font-bold ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}">${title}</h3>
                <p class="text-xs text-slate-300 font-mono">${msg}</p>
                <button type="button" onclick="window.close()" class="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">Close Window</button>
            `;
        }
    </script>
</body>
</html>

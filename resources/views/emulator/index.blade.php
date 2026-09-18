@extends('layouts.app')

@section('title', 'Developer Sandbox — Payment Gateway Emulator')

@section('content')
<div class="py-8 bg-slate-900 text-slate-100 min-h-[calc(100vh-4rem)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header & Sandbox Title -->
        <div class="md:flex md:items-center md:justify-between mb-8 pb-6 border-b border-slate-800">
            <div class="min-w-0 flex-1">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-sm">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Developer Gateway Sandbox
                        </h1>
                        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
                            Simulate mobile money payment flows, test USSD pushes, and verify webhook callbacks end-to-end.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Status Indicator Badge -->
            <div class="mt-4 md:mt-0 flex items-center space-x-3">
                <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Sandbox Gateway Active</span>
                </div>
            </div>
        </div>

        <!-- Toast Feedback Banner -->
        <div id="toast" class="hidden fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl shadow-2xl text-xs font-medium border animate-slide-up transition-all"></div>

        <!-- Main Sandbox 2-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- LEFT COLUMN: Payment Dispatcher & Payload Inspector (5 cols) -->
            <div class="lg:col-span-5 space-y-6">
                
                <!-- Payment Initiator Card -->
                <div class="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 shadow-xl backdrop-blur-sm">
                    <h2 class="text-base font-bold text-white mb-6 pb-3 border-b border-slate-700/60 flex items-center space-x-2">
                        <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        <span>Dispatch Test Payment</span>
                    </h2>

                    <!-- Gateway Driver Selector -->
                    <div class="mb-5">
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Target Gateway Driver</label>
                        <div class="grid grid-cols-2 gap-3">
                            <button type="button" 
                                    id="tab-selcom" 
                                    onclick="selectGateway('selcom')" 
                                    class="p-3.5 rounded-xl border-2 text-center transition-all bg-emerald-950/20 border-emerald-500/60 text-emerald-300">
                                <div class="font-bold text-sm">SELCOM</div>
                                <div class="text-[11px] text-slate-400 mt-0.5">Order Checkout URL</div>
                            </button>

                            <button type="button" 
                                    id="tab-azampay" 
                                    onclick="selectGateway('azampay')" 
                                    class="p-3.5 rounded-xl border-2 text-center transition-all bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600">
                                <div class="font-bold text-sm">AZAMPAY</div>
                                <div class="text-[11px] text-slate-400 mt-0.5">USSD Push Simulation</div>
                            </button>
                        </div>
                    </div>

                    <!-- Payment Initiation Form -->
                    <form id="initiateForm" onsubmit="initiatePayment(event)" class="space-y-4">
                        <input type="hidden" id="gateway" value="selcom" />

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="amount" class="block text-xs font-semibold text-slate-300 mb-1">Amount (TZS)</label>
                                <input type="number" id="amount" placeholder="5000" min="1" value="5000" required 
                                       class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none">
                            </div>
                            <div>
                                <label for="phone" class="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                                <input type="text" id="phone" placeholder="0712345678" value="0712345678" required 
                                       class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none">
                            </div>
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <label for="external_reference" class="block text-xs font-semibold text-slate-300">External Reference ID</label>
                                <button type="button" onclick="generateRef()" class="text-[11px] font-mono text-sky-400 hover:underline">Auto-Generate</button>
                            </div>
                            <input type="text" id="external_reference" placeholder="ORDER-2026-001" required 
                                   class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none">
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="name" class="block text-xs font-semibold text-slate-400 mb-1">Customer Name <span class="text-slate-500">(opt)</span></label>
                                <input type="text" id="name" placeholder="John Doe" 
                                       class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-sky-400 outline-none">
                            </div>
                            <div>
                                <label for="email" class="block text-xs font-semibold text-slate-400 mb-1">Customer Email <span class="text-slate-500">(opt)</span></label>
                                <input type="email" id="email" placeholder="john@example.com" 
                                       class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-sky-400 outline-none">
                            </div>
                        </div>

                        <div>
                            <label for="remarks" class="block text-xs font-semibold text-slate-400 mb-1">Remarks <span class="text-slate-500">(opt)</span></label>
                            <input type="text" id="remarks" placeholder="Invoice #1092" 
                                   class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-sky-400 outline-none">
                        </div>

                        <button type="submit" id="submitBtn" class="w-full mt-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            <span id="submitText">Issue Payment Request</span>
                        </button>
                    </form>
                </div>

                <!-- API Sandbox Endpoints Card -->
                <div class="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 shadow-xl">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <span>Local Sandbox API Endpoints</span>
                    </h3>

                    <div class="space-y-3 font-mono text-xs">
                        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div class="text-[10px] uppercase font-bold text-emerald-400 mb-1">Processor Initiation Endpoint</div>
                            <div class="text-slate-300 break-all"><span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold mr-1">POST</span>{{ url('/api/v1/payments/initiate') }}</div>
                        </div>

                        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div class="text-[10px] uppercase font-bold text-slate-400 mb-1">Selcom Sandbox Base URL</div>
                            <div class="text-slate-300 break-all"><span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mr-1">POST</span>{{ url('/api/emulator/selcom') }}</div>
                        </div>

                        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div class="text-[10px] uppercase font-bold text-slate-400 mb-1">AzamPay Sandbox Base URL</div>
                            <div class="text-slate-300 break-all"><span class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold mr-1">POST</span>{{ url('/api/emulator/azampay') }}</div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- RIGHT COLUMN: Real-Time Transaction Queue & Action Console (7 cols) -->
            <div class="lg:col-span-7">
                <div class="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 shadow-xl backdrop-blur-sm">
                    
                    <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-700/60">
                        <h2 class="text-base font-bold text-white flex items-center space-x-2">
                            <svg class="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M3.75 4.5h16.5m-16.5 3.75h16.5" />
                            </svg>
                            <span>Live Telemetry & Queue Feed</span>
                        </h2>

                        <div class="flex items-center space-x-3">
                            <label class="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                                <span>Auto Sync</span>
                                <input type="checkbox" id="autoRefresh" checked onchange="toggleAutoRefresh()" class="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-400">
                            </label>

                            <button type="button" onclick="loadTransactions()" id="refreshBtn" class="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-colors flex items-center space-x-1">
                                <svg class="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    <!-- Telemetry Stats Grid -->
                    <div class="grid grid-cols-4 gap-3 mb-6">
                        <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50 text-center">
                            <div id="stat-pending" class="text-xl font-bold font-mono text-amber-400">—</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Pending</div>
                        </div>

                        <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50 text-center">
                            <div id="stat-approved" class="text-xl font-bold font-mono text-emerald-400">—</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Approved</div>
                        </div>

                        <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50 text-center">
                            <div id="stat-rejected" class="text-xl font-bold font-mono text-rose-400">—</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Rejected</div>
                        </div>

                        <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-700/50 text-center">
                            <div id="stat-total" class="text-xl font-bold font-mono text-sky-400">—</div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Total</div>
                        </div>
                    </div>

                    <!-- Filter Pill Bar -->
                    <div class="flex flex-wrap items-center gap-2 mb-6 text-xs">
                        <button type="button" class="filter-btn active px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300 font-semibold" data-filter="all" onclick="setFilter('all', this)">All</button>
                        <button type="button" class="filter-btn px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white" data-filter="pending" onclick="setFilter('pending', this)">Pending</button>
                        <button type="button" class="filter-btn px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white" data-filter="approved" onclick="setFilter('approved', this)">Approved</button>
                        <button type="button" class="filter-btn px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white" data-filter="rejected" onclick="setFilter('rejected', this)">Rejected</button>
                        <button type="button" class="filter-btn px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white" data-filter="selcom" onclick="setFilter('selcom', this)">Selcom Driver</button>
                        <button type="button" class="filter-btn px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white" data-filter="azampay" onclick="setFilter('azampay', this)">AzamPay Driver</button>
                    </div>

                    <!-- Scrollable Feed Container -->
                    <div class="max-h-[580px] overflow-y-auto pr-1 space-y-3" id="txList">
                        <div class="p-8 text-center text-slate-500 font-mono text-xs">
                            Loading transaction queue feed...
                        </div>
                    </div>

                </div>
            </div>

        </div>

    </div>
</div>

@endsection

@push('scripts')
<script>
    let allTransactions = [];
    let currentFilter = 'all';
    let autoRefresh = true;
    let refreshInterval = null;

    function generateRef() {
        document.getElementById('external_reference').value = 'ORDER-' + Date.now().toString().slice(-6);
    }

    document.addEventListener('DOMContentLoaded', () => {
        generateRef();
        loadTransactions();
        startAutoRefresh();
    });

    function selectGateway(gw) {
        document.getElementById('gateway').value = gw;

        const selcomBtn = document.getElementById('tab-selcom');
        const azamBtn = document.getElementById('tab-azampay');

        if (gw === 'selcom') {
            selcomBtn.className = 'p-3.5 rounded-xl border-2 text-center transition-all bg-emerald-950/20 border-emerald-500/60 text-emerald-300';
            azamBtn.className = 'p-3.5 rounded-xl border-2 text-center transition-all bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600';
        } else {
            azamBtn.className = 'p-3.5 rounded-xl border-2 text-center transition-all bg-indigo-950/20 border-indigo-500/60 text-indigo-300';
            selcomBtn.className = 'p-3.5 rounded-xl border-2 text-center transition-all bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600';
        }
    }

    async function initiatePayment(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const text = document.getElementById('submitText');
        btn.disabled = true;
        text.textContent = 'Processing Dispatch…';

        const payload = {
            gateway: document.getElementById('gateway').value,
            amount: document.getElementById('amount').value,
            phone: document.getElementById('phone').value,
            external_reference: document.getElementById('external_reference').value,
            name: document.getElementById('name').value || undefined,
            email: document.getElementById('email').value || undefined,
            remarks: document.getElementById('remarks').value || undefined,
        };

        try {
            const res = await fetch('/api/v1/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                showToast('success', 'Payment initiated! Request added to telemetry feed.');
                if (payload.gateway === 'selcom' && data.payment_url) {
                    window.open(data.payment_url, '_blank');
                    showToast('info', 'Opened Selcom Checkout URL in new tab.');
                }
                generateRef();
                loadTransactions();
            } else {
                showToast('error', data.message || 'Payment initiation failed.');
            }
        } catch (err) {
            showToast('error', 'Network failure: ' + err.message);
        } finally {
            btn.disabled = false;
            text.textContent = 'Issue Payment Request';
        }
    }

    async function loadTransactions() {
        try {
            const res = await fetch('/api/emulator/transactions', { headers: { 'Accept': 'application/json' } });
            allTransactions = await res.json();
            renderTransactions();
            updateStats();
        } catch (err) {
            console.error('Failed loading transactions:', err);
        }
    }

    function setFilter(filterKey, element) {
        currentFilter = filterKey;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.className = 'filter-btn px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white';
        });
        element.className = 'filter-btn active px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300 font-semibold';
        renderTransactions();
    }

    function renderTransactions() {
        const container = document.getElementById('txList');
        let filtered = allTransactions;

        if (['pending', 'approved', 'rejected', 'timeout'].includes(currentFilter)) {
            filtered = filtered.filter(t => t.status === currentFilter);
        } else if (['selcom', 'azampay'].includes(currentFilter)) {
            filtered = filtered.filter(t => t.gateway === currentFilter);
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center text-slate-500">
                    <svg class="w-10 h-10 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div class="font-bold text-slate-400 text-sm">No Matching Transactions</div>
                    <div class="text-xs text-slate-600 mt-1">Dispatch a new payment request to populate the telemetry feed.</div>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(tx => {
            const isSelcom = tx.gateway === 'selcom';
            const isPending = tx.status === 'pending';
            const formattedAmount = Number(tx.amount).toLocaleString();

            return `
            <div class="p-4 rounded-xl bg-slate-900/90 border ${isSelcom ? 'border-emerald-500/30' : 'border-indigo-500/30'} space-y-3">
                <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${isSelcom ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'}">
                        ${tx.gateway.toUpperCase()}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass(tx.status)}">
                        ${tx.status.toUpperCase()}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                        <span class="text-slate-500 block text-[10px] uppercase">Amount</span>
                        <span class="text-white font-bold text-sm">TZS ${formattedAmount}</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block text-[10px] uppercase">Phone</span>
                        <span class="text-slate-300">${tx.phone}</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block text-[10px] uppercase">Ref ID</span>
                        <span class="text-slate-300 truncate block">${tx.external_id}</span>
                    </div>
                    <div>
                        <span class="text-slate-500 block text-[10px] uppercase">Created</span>
                        <span class="text-slate-400 text-[11px]">${formatTime(tx.created_at)}</span>
                    </div>
                </div>

                ${isPending ? `
                <div class="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
                    <button type="button" onclick="resolveTx(${tx.id}, 'approve')" class="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors">
                        Approve
                    </button>
                    <button type="button" onclick="resolveTx(${tx.id}, 'reject')" class="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors">
                        Reject
                    </button>
                    <button type="button" onclick="resolveTx(${tx.id}, 'timeout')" class="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors">
                        Timeout
                    </button>
                </div>` : ''}
            </div>`;
        }).join('');
    }

    function statusBadgeClass(st) {
        switch(st) {
            case 'approved': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            case 'pending':  return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            case 'rejected': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            default: return 'bg-slate-700 text-slate-300';
        }
    }

    async function resolveTx(id, action) {
        try {
            const res = await fetch(`/api/emulator/resolve/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                showToast('success', `Transaction #${id} resolved: ${action.toUpperCase()}`);
                loadTransactions();
            } else {
                showToast('error', data.error || 'Resolution failed');
            }
        } catch (err) {
            showToast('error', 'Resolution error: ' + err.message);
        }
    }

    function updateStats() {
        const counts = { pending: 0, approved: 0, rejected: 0 };
        allTransactions.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });
        document.getElementById('stat-pending').textContent = counts.pending;
        document.getElementById('stat-approved').textContent = counts.approved;
        document.getElementById('stat-rejected').textContent = counts.rejected;
        document.getElementById('stat-total').textContent = allTransactions.length;
    }

    function toggleAutoRefresh() {
        autoRefresh = document.getElementById('autoRefresh').checked;
        if (autoRefresh) startAutoRefresh();
        else clearInterval(refreshInterval);
    }

    function startAutoRefresh() {
        clearInterval(refreshInterval);
        refreshInterval = setInterval(loadTransactions, 3000);
    }

    function formatTime(dtStr) {
        if (!dtStr) return 'just now';
        const d = new Date(dtStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function showToast(type, msg) {
        const t = document.getElementById('toast');
        t.className = `fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl shadow-2xl text-xs font-semibold border ${
            type === 'success' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300' :
            type === 'error' ? 'bg-rose-950 border-rose-500/40 text-rose-300' :
            'bg-sky-950 border-sky-500/40 text-sky-300'
        }`;
        t.textContent = msg;
        t.classList.remove('hidden');
        setTimeout(() => t.classList.add('hidden'), 4000);
    }
</script>
@endpush

import { renderLayout } from './layout.js';

export function renderEmulatorView() {
  const content = `
  <div x-data="emulatorData()" x-init="init()" class="space-y-6">
    <!-- Notice & Setup Guide -->
    <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-lg font-bold text-amber-900 flex items-center space-x-2">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Payment Emulator Sandbox</span>
          </h2>
          <p class="text-sm text-amber-800 mt-1">
            Test full payment flows without real gateway credentials or real money transactions.
          </p>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-amber-200 text-xs text-amber-900 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span class="font-bold block mb-1">Point AzamPay Base URLs to:</span>
          <code class="bg-amber-100 px-2 py-1 rounded font-mono text-[11px] block select-all"><span x-text="origin"></span>/api/emulator/azampay</code>
        </div>
        <div>
          <span class="font-bold block mb-1">Point Selcom Base URL to:</span>
          <code class="bg-amber-100 px-2 py-1 rounded font-mono text-[11px] block select-all"><span x-text="origin"></span>/api/emulator/selcom</code>
        </div>
      </div>
    </div>

    <!-- Live Transactions List -->
    <div class="bg-white shadow rounded-lg p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center space-x-2">
          <span>Sandbox Transactions</span>
          <span class="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-semibold" x-text="transactions.length + ' Total'"></span>
        </h3>
        <button @click="fetchTransactions()" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border">
          🔄 Refresh List
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th class="p-3 text-left">Time</th>
              <th class="p-3 text-left">Gateway</th>
              <th class="p-3 text-left">External ID</th>
              <th class="p-3 text-left">Phone</th>
              <th class="p-3 text-left">Amount</th>
              <th class="p-3 text-left">Status</th>
              <th class="p-3 text-right">Resolve Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <template x-if="transactions.length === 0">
              <tr>
                <td colspan="7" class="text-center py-8 text-slate-400 text-sm">
                  No emulator transactions captured yet. Send a payment initiation request to get started.
                </td>
              </tr>
            </template>
            <template x-for="txn in transactions" :key="txn.id">
              <tr class="hover:bg-slate-50">
                <td class="p-3 text-xs text-slate-500" x-text="new Date(txn.created_at).toLocaleTimeString()"></td>
                <td class="p-3 text-xs font-bold uppercase text-slate-700" x-text="txn.gateway"></td>
                <td class="p-3 font-mono text-xs font-semibold text-slate-900" x-text="txn.external_id"></td>
                <td class="p-3 text-xs" x-text="txn.phone"></td>
                <td class="p-3 text-xs font-semibold">TZS <span x-text="Number(txn.amount).toLocaleString()"></span></td>
                <td class="p-3">
                  <span class="px-2 py-0.5 text-xs font-bold rounded-full"
                    :class="{
                      'bg-yellow-100 text-yellow-800': txn.status === 'pending',
                      'bg-green-100 text-green-800': txn.status === 'approved',
                      'bg-red-100 text-red-800': txn.status === 'rejected' || txn.status === 'timeout'
                    }"
                    x-text="txn.status">
                  </span>
                </td>
                <td class="p-3 text-right space-x-1">
                  <template x-if="txn.status === 'pending'">
                    <div class="inline-flex space-x-1">
                      <button @click="resolveTxn(txn.id, 'approve')" class="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded shadow-sm">
                        ✓ Approve
                      </button>
                      <button @click="resolveTxn(txn.id, 'reject')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-sm">
                        ✗ Reject
                      </button>
                      <button @click="resolveTxn(txn.id, 'timeout')" class="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded shadow-sm">
                        ⏱ Timeout
                      </button>
                    </div>
                  </template>
                  <template x-if="txn.status !== 'pending'">
                    <span class="text-xs text-slate-400 italic">Resolved</span>
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    function emulatorData() {
      return {
        origin: window.location.origin,
        transactions: [],
        init() {
          this.fetchTransactions();
          setInterval(() => this.fetchTransactions(), 3000);
        },
        async fetchTransactions() {
          try {
            const res = await fetch('/api/emulator/transactions');
            if (res.ok) {
              this.transactions = await res.json();
            }
          } catch(e) {}
        },
        async resolveTxn(id, action) {
          const res = await fetch('/api/emulator/resolve/' + id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
          });
          const data = await res.json();
          if (data.error) {
            alert(data.error);
          } else {
            this.fetchTransactions();
          }
        }
      }
    }
  </script>`;

  return renderLayout({ title: 'Emulator Sandbox', activeTab: 'emulator', content });
}

import { renderLayout } from './layout.js';

export function renderEmulatorView() {
  const content = `
  <div x-data="emulatorData()" x-init="init()" class="space-y-6">
    
    <!-- Top Header Banner -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Payment Checkout Terminal &amp; Integration Testing Tool
          </h2>
          <p class="text-xs text-gray-600 mt-1">
            Initiate payment checkout requests, inspect raw gateway payloads, and export integration proofs for gateway technical teams.
          </p>
        </div>

        <button @click="autoConfigureSandbox()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded border border-gray-300 transition self-start md:self-auto">
          Switch Gateway Base URLs to Sandbox
        </button>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <span class="font-medium text-gray-700 block mb-0.5">AzamPay Sandbox Endpoint:</span>
          <code class="bg-gray-50 px-2 py-1 rounded font-mono text-[11px] border border-gray-200 block select-all"><span x-text="origin"></span>/api/emulator/azampay</code>
        </div>
        <div>
          <span class="font-medium text-gray-700 block mb-0.5">Selcom Sandbox Endpoint:</span>
          <code class="bg-gray-50 px-2 py-1 rounded font-mono text-[11px] border border-gray-200 block select-all"><span x-text="origin"></span>/api/emulator/selcom</code>
        </div>
      </div>
    </div>

    <!-- CHECKOUT FORM & INSPECTOR -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Checkout Form -->
      <div class="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 class="text-sm font-semibold text-gray-900 border-b pb-3">
          Payment Initiation Form
        </h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-medium text-gray-700 mb-1">Target Payment Gateway</label>
            <select x-model="form.gateway" class="w-full rounded border-gray-300 border p-2 text-xs font-medium focus:ring-indigo-500">
              <option value="azampay">AzamPay (USSD Mobile Push)</option>
              <option value="selcom">Selcom (Minimal Checkout / Card / MNO)</option>
            </select>
          </div>

          <div>
            <label class="block font-medium text-gray-700 mb-1">Customer Phone Number</label>
            <input type="text" x-model="form.phone" placeholder="0754123456 or 255712345678" class="w-full rounded border-gray-300 border p-2 text-xs">
            <span class="text-[10px] text-gray-400 mt-0.5 block">Accepts 07xx, 06xx, or 255xx</span>
          </div>

          <div>
            <label class="block font-medium text-gray-700 mb-1">Payment Amount (TZS)</label>
            <input type="number" x-model="form.amount" placeholder="10000" class="w-full rounded border-gray-300 border p-2 text-xs font-semibold text-gray-900">
          </div>

          <div x-show="form.gateway === 'azampay'">
            <label class="block font-medium text-gray-700 mb-1">Mobile Operator (Provider)</label>
            <select x-model="form.provider" class="w-full rounded border-gray-300 border p-2 text-xs">
              <option value="">Auto-Detect Operator</option>
              <option value="Mpesa">Vodacom M-Pesa</option>
              <option value="Tigo">Tigo Pesa</option>
              <option value="Airtel">Airtel Money</option>
              <option value="Halopesa">HaloPesa</option>
              <option value="Azampesa">AzamPesa</option>
            </select>
          </div>

          <div>
            <label class="block font-medium text-gray-700 mb-1">External Reference ID</label>
            <div class="flex space-x-1">
              <input type="text" x-model="form.external_reference" class="w-full rounded border-gray-300 border p-2 text-xs font-mono">
              <button @click="generateNewRef()" class="px-2 bg-gray-50 border border-gray-300 text-gray-600 rounded text-[11px]">New</button>
            </div>
          </div>

          <div>
            <label class="block font-medium text-gray-700 mb-1">Customer Name &amp; Email</label>
            <div class="grid grid-cols-2 gap-2">
              <input type="text" x-model="form.name" placeholder="John Doe" class="w-full rounded border-gray-300 border p-2 text-xs">
              <input type="email" x-model="form.email" placeholder="customer@example.com" class="w-full rounded border-gray-300 border p-2 text-xs">
            </div>
          </div>
        </div>

        <!-- Button Loading State -->
        <div x-show="loading" class="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs" x-cloak>
          Sending request to gateway endpoint. Please wait.
        </div>

        <button @click="submitCashWithdrawal()" :disabled="loading" :class="loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'" class="w-full py-2.5 text-white font-medium text-xs rounded transition">
          <span x-text="loading ? 'Processing Payment...' : 'Initiate Payment Request'"></span>
        </button>
      </div>

      <!-- Right Column: Payload Inspector -->
      <div class="lg:col-span-2 space-y-4">
        
        <!-- Response Status Box -->
        <div id="response-box" class="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-sm font-semibold text-gray-900">
              Gateway Response &amp; Integration Details
            </h3>

            <button @click="copyIntegrationProof()" x-show="latestResponse" class="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-medium rounded">
              Copy Payload JSON
            </button>
          </div>

          <template x-if="loading">
            <div class="py-12 text-center text-xs text-gray-500">
              Connecting to gateway endpoint...
            </div>
          </template>

          <template x-if="!loading && !latestResponse">
            <div class="text-center py-12 text-gray-400 text-xs">
              Submit the form on the left to inspect raw gateway initiation details.
            </div>
          </template>

          <template x-if="!loading && latestResponse">
            <div class="space-y-4 text-xs">
              <div class="p-3 rounded border flex items-center justify-between" :class="latestResponse.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'">
                <div>
                  <span class="font-semibold text-xs block" x-text="latestResponse.success ? 'Gateway Request Succeeded' : 'Gateway Request Failed'"></span>
                  <span class="text-xs" x-text="latestResponse.message"></span>
                </div>
                <template x-if="latestResponse.payment_url">
                  <a :href="latestResponse.payment_url" target="_blank" class="px-3 py-1 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition">
                    Open Payment Page
                  </a>
                </template>
              </div>

              <div>
                <h4 class="font-medium text-gray-700 mb-1">Initiation Response Payload (Raw JSON):</h4>
                <pre class="bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded font-mono text-[11px] overflow-x-auto" x-text="JSON.stringify(latestResponse, null, 2)"></pre>
              </div>
            </div>
          </template>
        </div>

        <!-- Sandbox Transactions Table -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-sm font-semibold text-gray-900">
              Sandbox Transaction Log (<span x-text="transactions.length"></span>)
            </h3>
            <button @click="fetchTransactions()" class="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
              Refresh
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50 text-xs font-medium text-gray-600">
                <tr>
                  <th class="p-3 text-left">Time</th>
                  <th class="p-3 text-left">Gateway</th>
                  <th class="p-3 text-left">External Reference</th>
                  <th class="p-3 text-left">Phone</th>
                  <th class="p-3 text-left">Amount</th>
                  <th class="p-3 text-left">Status</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <template x-if="transactions.length === 0">
                  <tr>
                    <td colspan="7" class="text-center py-8 text-gray-400 text-xs">
                      No sandbox transactions recorded yet.
                    </td>
                  </tr>
                </template>
                <template x-for="txn in transactions" :key="txn.id">
                  <tr class="hover:bg-gray-50">
                    <td class="p-3 text-xs text-gray-500" x-text="new Date(txn.created_at).toLocaleTimeString()"></td>
                    <td class="p-3 text-xs font-medium uppercase text-gray-700" x-text="txn.gateway"></td>
                    <td class="p-3 font-mono text-xs font-semibold text-gray-900" x-text="txn.external_id"></td>
                    <td class="p-3 text-xs" x-text="txn.phone"></td>
                    <td class="p-3 text-xs font-semibold">TZS <span x-text="Number(txn.amount).toLocaleString()"></span></td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 text-xs font-medium rounded border"
                        :class="{
                          'bg-yellow-50 text-yellow-700 border-yellow-200': txn.status === 'pending',
                          'bg-green-50 text-green-700 border-green-200': txn.status === 'approved',
                          'bg-red-50 text-red-700 border-red-200': txn.status === 'rejected' || txn.status === 'timeout'
                        }"
                        x-text="txn.status">
                      </span>
                    </td>
                    <td class="p-3 text-right space-x-1">
                      <template x-if="txn.status === 'pending'">
                        <div class="inline-flex space-x-1">
                          <template x-if="txn.gateway === 'selcom'">
                            <a :href="'/emulator/selcom-pay/' + txn.external_id" target="_blank" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded">
                              Pay Page
                            </a>
                          </template>
                          <button @click="resolveTxn(txn.id, 'approve')" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded">
                            Approve
                          </button>
                          <button @click="resolveTxn(txn.id, 'reject')" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded">
                            Reject
                          </button>
                        </div>
                      </template>
                      <template x-if="txn.status !== 'pending'">
                        <span class="text-xs text-gray-400 italic">Callback Sent</span>
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>

  <script>
    function emulatorData() {
      return {
        origin: window.location.origin,
        transactions: [],
        loading: false,
        latestResponse: null,
        form: {
          gateway: 'azampay',
          phone: '0754123456',
          amount: 10000,
          provider: '',
          external_reference: 'ORDER-' + Math.floor(Math.random() * 1000000),
          name: 'Customer Test',
          email: 'customer@example.com'
        },
        init() {
          this.fetchTransactions();
          setInterval(() => this.fetchTransactions(), 3000);
        },
        generateNewRef() {
          this.form.external_reference = 'ORDER-' + Math.floor(Math.random() * 1000000);
        },
        async autoConfigureSandbox() {
          const res = await fetch('/api/emulator/configure-sandbox', { method: 'POST' });
          const data = await res.json();
          alert(data.message || 'Sandbox configured successfully');
        },
        async submitCashWithdrawal() {
          if (this.loading) return;
          this.loading = true;
          this.latestResponse = null;

          try {
            const payload = {
              gateway: this.form.gateway,
              amount: parseFloat(this.form.amount),
              phone: this.form.phone,
              external_reference: this.form.external_reference,
              name: this.form.name,
              email: this.form.email,
              remarks: 'Payment Initiation Test'
            };

            if (this.form.gateway === 'azampay' && this.form.provider) {
              payload.provider = this.form.provider;
            }

            const res = await fetch('/api/v1/payments/initiate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            const data = await res.json();
            this.latestResponse = data;
            this.fetchTransactions();
            this.generateNewRef();

            setTimeout(() => {
              const el = document.getElementById('response-box');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } catch(e) {
            this.latestResponse = { success: false, message: 'Initiation request failed: ' + e.message };
          } finally {
            this.loading = false;
          }
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
        },
        copyIntegrationProof() {
          if (!this.latestResponse) return;
          const str = JSON.stringify(this.latestResponse, null, 2);
          navigator.clipboard.writeText(str);
          alert('Payload JSON copied to clipboard.');
        }
      }
    }
  </script>`;

  return renderLayout({ title: 'Payment Terminal & Integration Proof Tool', activeTab: 'emulator', content });
}

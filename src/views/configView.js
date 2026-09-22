import { renderLayout } from './layout.js';

export function renderConfigView(configs, logsData, flashMessage = null, queryParams = {}) {
  const activeGateway = configs.active_gateway || 'selcom';
  const webappCallbackUrl = configs.webapp_callback_url || '';

  const selcomBaseUrl = configs.selcom_base_url || '';
  const selcomApiKey = configs.selcom_api_key || '';
  const selcomSecretKey = configs.selcom_secret_key || '';
  const selcomVendor = configs.selcom_vendor || '';

  const azamBaseUrl = configs.azampay_base_url || '';
  const azamAuthBaseUrl = configs.azampay_auth_base_url || '';
  const azamClientId = configs.azampay_client_id || '';
  const azamClientSecret = configs.azampay_client_secret || '';
  const azamAppName = configs.azampay_app_name || '';
  const azamApiKey = configs.azampay_api_key || '';

  const searchVal = queryParams.search || '';
  const gatewayFilter = queryParams.gateway || 'all';
  const statusFilter = queryParams.status || 'all';

  const logs = logsData.data || [];
  const currentPage = logsData.current_page || 1;
  const lastPage = logsData.last_page || 1;
  const totalLogs = logsData.total || 0;

  const content = `
  <div x-data="{ activeTab: 'settings', selectedLogs: [], showModal: false, modalLog: null }">
    
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button @click="activeTab = 'settings'" :class="activeTab === 'settings' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-3 px-1 border-b-2 text-sm">
          Gateway Settings
        </button>
        <button @click="activeTab = 'logs'" :class="activeTab === 'logs' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-3 px-1 border-b-2 text-sm">
          Transaction Logs (${totalLogs})
        </button>
      </nav>
    </div>

    <!-- SETTINGS TAB -->
    <div x-show="activeTab === 'settings'" class="space-y-6">
      <form action="/config/save" method="POST">
        
        <!-- General Settings -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4 border-b pb-2">General Middleware Settings</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Active Gateway Driver</label>
              <select name="active_gateway" class="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="selcom" ${activeGateway === 'selcom' ? 'selected' : ''}>Selcom Payment Gateway</option>
                <option value="azampay" ${activeGateway === 'azampay' ? 'selected' : ''}>AzamPay Mobile Money</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Default gateway used when request payload does not specify one.</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">WebApp Callback Forwarding URL</label>
              <input type="text" name="webapp_callback_url" value="${webappCallbackUrl}" placeholder="https://your-app.com/api/payments/callback" class="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <p class="text-xs text-gray-500 mt-1">Endpoint on your application where normalized callback webhooks will be posted.</p>
            </div>
          </div>
        </div>

        <!-- Selcom Config -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-base font-semibold text-gray-900">Selcom Gateway Configuration</h2>
            <button type="submit" name="test_gateway" value="selcom" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded border border-gray-300 transition">
              Test Selcom Connection
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Base URL</label>
              <input type="text" name="selcom_base_url" value="${selcomBaseUrl}" placeholder="https://apigw.selcom.tz/v1" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Vendor ID (Till Number)</label>
              <input type="text" name="selcom_vendor" value="${selcomVendor}" placeholder="VEND1234" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">API Key</label>
              <input type="text" name="selcom_api_key" value="${selcomApiKey}" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">API Secret Key</label>
              <input type="password" name="selcom_secret_key" value="${selcomSecretKey}" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
          </div>
        </div>

        <!-- AzamPay Config -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-base font-semibold text-gray-900">AzamPay Gateway Configuration</h2>
            <button type="submit" name="test_gateway" value="azampay" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded border border-gray-300 transition">
              Test AzamPay Connection
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">API Base URL</label>
              <input type="text" name="azampay_base_url" value="${azamBaseUrl}" placeholder="https://checkout.azampay.co.tz" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Authenticator Base URL</label>
              <input type="text" name="azampay_auth_base_url" value="${azamAuthBaseUrl}" placeholder="https://authenticator.azampay.co.tz" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Client ID</label>
              <input type="text" name="azampay_client_id" value="${azamClientId}" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Client Secret</label>
              <input type="password" name="azampay_client_secret" value="${azamClientSecret}" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">App Name</label>
              <input type="text" name="azampay_app_name" value="${azamAppName}" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">X-API-KEY</label>
              <input type="password" name="azampay_api_key" value="${azamApiKey}" class="w-full rounded-md border-gray-300 border p-2 text-sm">
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md transition">
            Save Configurations
          </button>
        </div>
      </form>
    </div>

    <!-- LOGS TAB -->
    <div x-show="activeTab === 'logs'" class="space-y-4">
      
      <!-- Filters and Actions Bar -->
      <div class="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <form action="/" method="GET" class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input type="hidden" name="tab" value="logs">
          <input type="text" name="search" value="${searchVal}" placeholder="Search ref, phone..." class="border rounded p-2 text-xs w-48 border-gray-300">
          <select name="gateway" class="border rounded p-2 text-xs border-gray-300">
            <option value="all" ${gatewayFilter === 'all' ? 'selected' : ''}>All Gateways</option>
            <option value="selcom" ${gatewayFilter === 'selcom' ? 'selected' : ''}>Selcom</option>
            <option value="azampay" ${gatewayFilter === 'azampay' ? 'selected' : ''}>AzamPay</option>
          </select>
          <select name="status" class="border rounded p-2 text-xs border-gray-300">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="success" ${statusFilter === 'success' ? 'selected' : ''}>Success</option>
            <option value="failed" ${statusFilter === 'failed' ? 'selected' : ''}>Failed</option>
          </select>
          <button type="submit" class="px-3 py-2 bg-gray-800 text-white text-xs font-medium rounded hover:bg-gray-900">Filter</button>
        </form>

        <div class="flex items-center space-x-2">
          <a href="/logs/export?format=csv&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-medium rounded">Export CSV</a>
          <a href="/logs/export?format=json&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-medium rounded">Export JSON</a>
          <button @click="bulkDeleteSelected()" x-show="selectedLogs.length > 0" class="px-3 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700">Delete Selected (<span x-text="selectedLogs.length"></span>)</button>
          <button @click="bulkRetryFailed()" class="px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700">Retry Failed</button>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-left"><input type="checkbox" @change="toggleAll($event)"></th>
              <th class="p-3 text-left font-medium text-gray-600 text-xs">Date</th>
              <th class="p-3 text-left font-medium text-gray-600 text-xs">External Reference</th>
              <th class="p-3 text-left font-medium text-gray-600 text-xs">Gateway</th>
              <th class="p-3 text-left font-medium text-gray-600 text-xs">Phone</th>
              <th class="p-3 text-left font-medium text-gray-600 text-xs">Amount</th>
              <th class="p-3 text-left font-medium text-gray-600 text-xs">Status</th>
              <th class="p-3 text-right font-medium text-gray-600 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${
              logs.length === 0
                ? `<tr><td colspan="8" class="text-center py-8 text-gray-500 text-sm">No transaction logs found.</td></tr>`
                : logs
                    .map(
                      (log) => `
            <tr class="hover:bg-gray-50">
              <td class="p-3"><input type="checkbox" value="${log.id}" x-model="selectedLogs"></td>
              <td class="p-3 text-xs text-gray-500">${new Date(log.created_at).toLocaleString()}</td>
              <td class="p-3 font-mono text-xs font-semibold text-gray-900">${log.external_reference}</td>
              <td class="p-3 text-xs uppercase font-medium text-gray-700">${log.gateway}</td>
              <td class="p-3 text-xs">${log.phone}</td>
              <td class="p-3 text-xs font-semibold text-gray-900">TZS ${Number(log.amount).toLocaleString()}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 text-xs font-medium rounded border ${
                  log.status === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : log.status === 'failed'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }">
                  ${log.status}
                </span>
              </td>
              <td class="p-3 text-right space-x-2">
                <button @click='openLogModal(${JSON.stringify(log).replace(/'/g, "&apos;")})' class="text-indigo-600 hover:text-indigo-900 text-xs font-medium">View</button>
                ${
                  log.status === 'failed'
                    ? `<button @click="retryLog(${log.id})" class="text-amber-600 hover:text-amber-900 text-xs font-medium">Retry</button>`
                    : ''
                }
                <button @click="deleteLog(${log.id})" class="text-red-600 hover:text-red-900 text-xs font-medium">Delete</button>
              </td>
            </tr>`
                    )
                    .join('')
            }
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
          <span>Showing Page ${currentPage} of ${lastPage} (${totalLogs} total logs)</span>
          <div class="space-x-1">
            ${
              currentPage > 1
                ? `<a href="/?tab=logs&page=${currentPage - 1}&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-1 bg-white border border-gray-300 rounded">Prev</a>`
                : ''
            }
            ${
              currentPage < lastPage
                ? `<a href="/?tab=logs&page=${currentPage + 1}&search=${searchVal}&gateway=${gatewayFilter}&status=${statusFilter}" class="px-3 py-1 bg-white border border-gray-300 rounded">Next</a>`
                : ''
            }
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div x-show="showModal" class="fixed inset-0 bg-gray-900/40 flex items-center justify-center p-4 z-50" x-cloak>
      <div class="bg-white rounded-lg max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="flex justify-between items-center border-b pb-2">
          <h3 class="text-base font-semibold text-gray-900">Transaction Detail</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>
        <template x-if="modalLog">
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
              <div><strong>External Ref:</strong> <span x-text="modalLog.external_reference"></span></div>
              <div><strong>Gateway Ref:</strong> <span x-text="modalLog.gateway_reference || 'N/A'"></span></div>
              <div><strong>Gateway:</strong> <span x-text="modalLog.gateway" class="uppercase"></span></div>
              <div><strong>Status:</strong> <span x-text="modalLog.status" class="font-semibold"></span></div>
              <div><strong>Amount:</strong> TZS <span x-text="Number(modalLog.amount).toLocaleString()"></span></div>
              <div><strong>Phone:</strong> <span x-text="modalLog.phone"></span></div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-1">Raw Request Payload</h4>
              <pre class="bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded font-mono overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.raw_request, null, 2)"></pre>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-1">Raw Response Payload</h4>
              <pre class="bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded font-mono overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.raw_response, null, 2)"></pre>
            </div>

            <div>
              <h4 class="font-semibold text-gray-700 mb-1">Callback Payload</h4>
              <pre class="bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded font-mono overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.callback_payload, null, 2)"></pre>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <script>
    function toggleAll(e) {
      const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
      const checked = e.target.checked;
      checkboxes.forEach(cb => cb.checked = checked);
    }

    function openLogModal(log) {
      const el = document.querySelector('[x-data]');
      if (el && el._x_dataStack) {
        el._x_dataStack[0].modalLog = log;
        el._x_dataStack[0].showModal = true;
      }
    }

    async function deleteLog(id) {
      if (!confirm('Delete this transaction log?')) return;
      const res = await fetch('/logs/' + id, { method: 'DELETE' });
      if (res.ok) window.location.reload();
    }

    async function bulkDeleteSelected() {
      const checkboxes = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
      if (checkboxes.length === 0) return;
      if (!confirm('Delete selected ' + checkboxes.length + ' logs?')) return;
      const res = await fetch('/logs/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: checkboxes })
      });
      if (res.ok) window.location.reload();
    }

    async function retryLog(id) {
      const res = await fetch('/logs/retry/' + id, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Retry initiated');
      window.location.reload();
    }

    async function bulkRetryFailed() {
      if (!confirm('Retry all failed transactions?')) return;
      const res = await fetch('/logs/bulk-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all_failed' })
      });
      const data = await res.json();
      alert(data.message || 'Bulk retry completed');
      window.location.reload();
    }
  </script>`;

  return renderLayout({ title: 'Gateway Settings & Logs', activeTab: 'config', content, flashMessage });
}

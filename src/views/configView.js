import { renderLayout } from './layout.js';

export function renderConfigView(configs, logsData, flashMessage = null, queryParams = {}) {
  const envMode = configs.environment_mode || 'sandbox';
  const activeGateway = configs.active_gateway || 'selcom';
  const webappCallbackUrl = configs.webapp_callback_url || '';

  // Live AzamPay Configs
  const liveAzamBaseUrl = configs.live_azampay_base_url || configs.azampay_base_url || 'https://checkout.azampay.co.tz';
  const liveAzamAuthBaseUrl = configs.live_azampay_auth_base_url || configs.azampay_auth_base_url || 'https://authenticator.azampay.co.tz';
  const liveAzamClientId = configs.live_azampay_client_id || configs.azampay_client_id || '';
  const liveAzamClientSecret = configs.live_azampay_client_secret || configs.azampay_client_secret || '';
  const liveAzamAppName = configs.live_azampay_app_name || configs.azampay_app_name || '';
  const liveAzamApiKey = configs.live_azampay_api_key || configs.azampay_api_key || '';

  // Sandbox AzamPay Configs
  const sandboxAzamBaseUrl = configs.sandbox_azampay_base_url || '';
  const sandboxAzamAuthBaseUrl = configs.sandbox_azampay_auth_base_url || '';
  const sandboxAzamClientId = configs.sandbox_azampay_client_id || '';
  const sandboxAzamClientSecret = configs.sandbox_azampay_client_secret || '';
  const sandboxAzamAppName = configs.sandbox_azampay_app_name || '';
  const sandboxAzamApiKey = configs.sandbox_azampay_api_key || '';

  // Live Selcom Configs
  const liveSelcomBaseUrl = configs.live_selcom_base_url || configs.selcom_base_url || 'https://apigw.selcom.tz/v1';
  const liveSelcomApiKey = configs.live_selcom_api_key || configs.selcom_api_key || '';
  const liveSelcomSecretKey = configs.live_selcom_secret_key || configs.selcom_secret_key || '';
  const liveSelcomVendor = configs.live_selcom_vendor || configs.selcom_vendor || '';

  // Sandbox Selcom Configs
  const sandboxSelcomBaseUrl = configs.sandbox_selcom_base_url || '';
  const sandboxSelcomApiKey = configs.sandbox_selcom_api_key || '';
  const sandboxSelcomSecretKey = configs.sandbox_selcom_secret_key || '';
  const sandboxSelcomVendor = configs.sandbox_selcom_vendor || '';

  const searchVal = queryParams.search || '';
  const gatewayFilter = queryParams.gateway || 'all';
  const statusFilter = queryParams.status || 'all';

  const initialLogs = logsData.data || [];
  const initialCurrentPage = logsData.current_page || 1;
  const initialLastPage = logsData.last_page || 1;
  const initialTotalLogs = logsData.total || 0;

  const content = `
  <div x-data="configDashboard()" x-init="initDashboard()" class="relative">
    
    <!-- Floating Toast Notification Banner (Zero Page Reload UX) -->
    <div x-show="toast.show" 
         x-transition:enter="transition ease-out duration-300 transform"
         x-transition:enter-start="opacity-0 -translate-y-4"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-200 transform"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 -translate-y-4"
         class="fixed top-4 right-4 z-50 max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5"
         :class="toast.type === 'error' ? 'bg-red-900 text-white' : toast.type === 'success' ? 'bg-emerald-900 text-white' : 'bg-slate-900 text-white'"
         x-cloak>
      <div class="p-4 flex items-start gap-3 w-full">
        <div class="flex-shrink-0 pt-0.5">
          <template x-if="toast.type === 'success'">
            <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
          </template>
          <template x-if="toast.type === 'error'">
            <i class="fa-solid fa-circle-exclamation text-red-400 text-lg"></i>
          </template>
          <template x-if="toast.type === 'info'">
            <i class="fa-solid fa-circle-info text-blue-400 text-lg"></i>
          </template>
        </div>
        <div class="flex-1 text-xs">
          <p class="font-bold mb-0.5" x-text="toast.title || 'Notification'"></p>
          <p class="opacity-90 leading-relaxed" x-text="toast.message"></p>
        </div>
        <button @click="toast.show = false" class="text-white opacity-60 hover:opacity-100">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Top Navigation Tabs (FontAwesome Clean Icons) -->
    <div class="border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm px-4">
      <nav class="-mb-px flex space-x-6 overflow-x-auto">
        <button @click="activeTab = 'general'" 
          :class="activeTab === 'general' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" 
          class="whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2">
          <i class="fa-solid fa-sliders text-gray-500"></i> Global Routing & Mode
        </button>

        <button @click="activeTab = 'azampay'" 
          :class="activeTab === 'azampay' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" 
          class="whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2">
          <i class="fa-solid fa-mobile-screen-button text-amber-600"></i> AzamPay Gateway Panel
        </button>

        <button @click="activeTab = 'selcom'" 
          :class="activeTab === 'selcom' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" 
          class="whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2">
          <i class="fa-solid fa-credit-card text-purple-600"></i> Selcom Gateway Panel
        </button>

        <button @click="activeTab = 'logs'; fetchPaymentLogs()" 
          :class="activeTab === 'logs' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" 
          class="whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2">
          <i class="fa-solid fa-list-check text-indigo-500"></i> Payment Logs (<span x-text="payTotal"></span>)
        </button>

        <button @click="activeTab = 'requests'; fetchRequestLogs()" 
          :class="activeTab === 'requests' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" 
          class="whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2">
          <i class="fa-solid fa-network-wired text-blue-500"></i> Request Inspector
        </button>

        <button @click="activeTab = 'status_checker'" 
          :class="activeTab === 'status_checker' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" 
          class="whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2">
          <i class="fa-solid fa-magnifying-glass-chart text-emerald-600"></i> Live Status Checker
        </button>
      </nav>
    </div>

    <!-- TAB 1: GLOBAL ROUTING & ENVIRONMENT MODE -->
    <div x-show="activeTab === 'general'" class="space-y-6">
      <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 class="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center justify-between">
          <span class="flex items-center gap-2">
            <i class="fa-solid fa-sliders text-indigo-600"></i> Global Environment & Routing Configuration
          </span>
          <span :class="form.environment_mode === 'live' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'" class="text-xs px-3 py-1 rounded font-bold uppercase border flex items-center gap-1.5">
            <i class="fa-solid fa-circle text-[8px]" :class="form.environment_mode === 'live' ? 'text-red-600' : 'text-amber-600'"></i>
            <span x-text="'Active Mode: ' + form.environment_mode.toUpperCase()"></span>
          </span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Environment Mode -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Active Environment Mode</label>
            <select x-model="form.environment_mode" class="w-full rounded-md border-gray-300 border p-2.5 text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500">
              <option value="sandbox">SANDBOX / TESTING (Uses Sandbox Credentials)</option>
              <option value="live">LIVE PRODUCTION (Uses Live Credentials)</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Switching modes toggles between your persistent Live and Sandbox credentials without replacing them.</p>
          </div>

          <!-- Active Gateway -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Gateway Driver</label>
            <select x-model="form.active_gateway" class="w-full rounded-md border-gray-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="selcom">Selcom Payment Gateway</option>
              <option value="azampay">AzamPay Mobile Money</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Default payment provider used when request payload omits gateway field.</p>
          </div>

          <!-- WebApp Callback URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">WebApp Callback Forwarding URL</label>
            <input type="text" x-model="form.webapp_callback_url" placeholder="https://your-app.com/api/payments/callback" class="w-full rounded-md border-gray-300 border p-2.5 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500">
            <p class="text-xs text-gray-500 mt-1">Endpoint on your web app where normalized payment webhooks are delivered.</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button type="button" @click="saveConfig()" :disabled="saving" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-md transition shadow flex items-center gap-2">
          <i class="fa-solid" :class="saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
          <span x-text="saving ? 'Saving...' : 'Save System Settings'"></span>
        </button>
      </div>
    </div>

    <!-- TAB 2: DEDICATED AZAMPAY GATEWAY PANEL -->
    <div x-show="activeTab === 'azampay'" class="space-y-6">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-mobile-screen-button text-amber-600 text-2xl"></i>
          <div>
            <h3 class="text-sm font-bold text-amber-900">AzamPay Mobile Money Driver Panel</h3>
            <p class="text-xs text-amber-700">Manage separate, persistent credentials for Live Production and Sandbox Testing environments.</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button type="button" @click="testConnection('live_azampay')" :disabled="testing" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow transition flex items-center gap-1.5">
            <i class="fa-solid fa-plug-circle-check"></i> Test Live AzamPay
          </button>
          <button type="button" @click="testConnection('sandbox_azampay')" :disabled="testing" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded shadow transition flex items-center gap-1.5">
            <i class="fa-solid fa-plug-circle-check"></i> Test Sandbox AzamPay
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- LIVE AZAMPAY PANEL -->
        <div class="bg-white border-2 border-red-200 rounded-lg p-6 shadow-sm relative">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="text-sm font-bold text-red-900 flex items-center gap-2">
              <i class="fa-solid fa-circle text-red-600 text-[10px]"></i> Live Production Credentials
              <span class="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono">PERSISTENT</span>
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live API Base URL</label>
              <input type="text" x-model="form.live_azampay_base_url" placeholder="https://checkout.azampay.co.tz" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live Authenticator Base URL</label>
              <input type="text" x-model="form.live_azampay_auth_base_url" placeholder="https://authenticator.azampay.co.tz" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live App Name</label>
              <input type="text" x-model="form.live_azampay_app_name" placeholder="Live Azam App Name" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live Client ID</label>
              <input type="text" x-model="form.live_azampay_client_id" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live Client Secret</label>
              <div x-data="{ show: false }" class="relative">
                <input :type="show ? 'text' : 'password'" x-model="form.live_azampay_client_secret" class="w-full rounded-md border-gray-300 border p-2 pr-10 text-xs font-mono">
                <button type="button" @click="show = !show" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" title="Toggle visibility">
                  <i class="fa-solid" :class="show ? 'fa-eye-slash text-indigo-600' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live X-API-KEY</label>
              <div x-data="{ show: false }" class="relative">
                <input :type="show ? 'text' : 'password'" x-model="form.live_azampay_api_key" class="w-full rounded-md border-gray-300 border p-2 pr-10 text-xs font-mono">
                <button type="button" @click="show = !show" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" title="Toggle visibility">
                  <i class="fa-solid" :class="show ? 'fa-eye-slash text-indigo-600' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SANDBOX AZAMPAY PANEL -->
        <div class="bg-white border-2 border-amber-200 rounded-lg p-6 shadow-sm relative">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="text-sm font-bold text-amber-900 flex items-center gap-2">
              <i class="fa-solid fa-circle text-amber-500 text-[10px]"></i> Sandbox / Testing Credentials
              <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">ISOLATED</span>
            </h3>
            <button type="button" @click="autoFillSandboxAzam()" class="text-[11px] text-amber-700 hover:text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-300 flex items-center gap-1">
              <i class="fa-solid fa-bolt text-amber-500"></i> Point to Local Emulator
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox API Base URL</label>
              <input type="text" x-model="form.sandbox_azampay_base_url" placeholder="https://payment-processor.domain/api/emulator/azampay" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox Authenticator Base URL</label>
              <input type="text" x-model="form.sandbox_azampay_auth_base_url" placeholder="https://payment-processor.domain/api/emulator/azampay" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox App Name</label>
              <input type="text" x-model="form.sandbox_azampay_app_name" placeholder="EmulatorApp" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox Client ID</label>
              <input type="text" x-model="form.sandbox_azampay_client_id" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox Client Secret</label>
              <div x-data="{ show: false }" class="relative">
                <input :type="show ? 'text' : 'password'" x-model="form.sandbox_azampay_client_secret" class="w-full rounded-md border-gray-300 border p-2 pr-10 text-xs font-mono">
                <button type="button" @click="show = !show" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" title="Toggle visibility">
                  <i class="fa-solid" :class="show ? 'fa-eye-slash text-indigo-600' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox X-API-KEY</label>
              <div x-data="{ show: false }" class="relative">
                <input :type="show ? 'text' : 'password'" x-model="form.sandbox_azampay_api_key" class="w-full rounded-md border-gray-300 border p-2 pr-10 text-xs font-mono">
                <button type="button" @click="show = !show" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" title="Toggle visibility">
                  <i class="fa-solid" :class="show ? 'fa-eye-slash text-indigo-600' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="flex justify-end">
        <button type="button" @click="saveConfig()" :disabled="saving" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md transition shadow flex items-center gap-2">
          <i class="fa-solid" :class="saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
          <span x-text="saving ? 'Saving...' : 'Save AzamPay Configurations'"></span>
        </button>
      </div>
    </div>

    <!-- TAB 3: DEDICATED SELCOM GATEWAY PANEL -->
    <div x-show="activeTab === 'selcom'" class="space-y-6">
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-credit-card text-purple-600 text-2xl"></i>
          <div>
            <h3 class="text-sm font-bold text-purple-900">Selcom Payment Gateway Panel</h3>
            <p class="text-xs text-purple-700">Manage separate, persistent credentials for Live Production and Sandbox Testing environments.</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button type="button" @click="testConnection('live_selcom')" :disabled="testing" class="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded shadow transition flex items-center gap-1.5">
            <i class="fa-solid fa-plug-circle-check"></i> Test Live Selcom
          </button>
          <button type="button" @click="testConnection('sandbox_selcom')" :disabled="testing" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded shadow transition flex items-center gap-1.5">
            <i class="fa-solid fa-plug-circle-check"></i> Test Sandbox Selcom
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- LIVE SELCOM PANEL -->
        <div class="bg-white border-2 border-purple-200 rounded-lg p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="text-sm font-bold text-purple-900 flex items-center gap-2">
              <i class="fa-solid fa-circle text-purple-600 text-[10px]"></i> Live Production Credentials
              <span class="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">PERSISTENT</span>
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live API Base URL</label>
              <input type="text" x-model="form.live_selcom_base_url" placeholder="https://apigw.selcom.tz/v1" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live Vendor ID (Till Number)</label>
              <input type="text" x-model="form.live_selcom_vendor" placeholder="VEND1234" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live API Key</label>
              <input type="text" x-model="form.live_selcom_api_key" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Live API Secret Key</label>
              <div x-data="{ show: false }" class="relative">
                <input :type="show ? 'text' : 'password'" x-model="form.live_selcom_secret_key" class="w-full rounded-md border-gray-300 border p-2 pr-10 text-xs font-mono">
                <button type="button" @click="show = !show" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" title="Toggle visibility">
                  <i class="fa-solid" :class="show ? 'fa-eye-slash text-indigo-600' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SANDBOX SELCOM PANEL -->
        <div class="bg-white border-2 border-indigo-200 rounded-lg p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <i class="fa-solid fa-circle text-indigo-500 text-[10px]"></i> Sandbox / Testing Credentials
              <span class="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono">ISOLATED</span>
            </h3>
            <button type="button" @click="autoFillSandboxSelcom()" class="text-[11px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-300 flex items-center gap-1">
              <i class="fa-solid fa-bolt text-amber-500"></i> Point to Local Emulator
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox API Base URL</label>
              <input type="text" x-model="form.sandbox_selcom_base_url" placeholder="https://payment-processor.domain/api/emulator/selcom" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox Vendor ID (Till Number)</label>
              <input type="text" x-model="form.sandbox_selcom_vendor" placeholder="EMU_TILL_123" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox API Key</label>
              <input type="text" x-model="form.sandbox_selcom_api_key" class="w-full rounded-md border-gray-300 border p-2 text-xs font-mono">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Sandbox API Secret Key</label>
              <div x-data="{ show: false }" class="relative">
                <input :type="show ? 'text' : 'password'" x-model="form.sandbox_selcom_secret_key" class="w-full rounded-md border-gray-300 border p-2 pr-10 text-xs font-mono">
                <button type="button" @click="show = !show" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" title="Toggle visibility">
                  <i class="fa-solid" :class="show ? 'fa-eye-slash text-indigo-600' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="flex justify-end">
        <button type="button" @click="saveConfig()" :disabled="saving" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md transition shadow flex items-center gap-2">
          <i class="fa-solid" :class="saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
          <span x-text="saving ? 'Saving...' : 'Save Selcom Configurations'"></span>
        </button>
      </div>
    </div>

    <!-- TAB 4: PAYMENT LOGS TAB -->
    <div x-show="activeTab === 'logs'" class="space-y-4">
      
      <!-- Filters and Actions Bar -->
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input type="text" x-model="paySearch" @input.debounce.300ms="fetchPaymentLogs()" placeholder="Search ref, phone..." class="border rounded p-2 text-xs w-48 border-gray-300">
          
          <select x-model="payGateway" @change="fetchPaymentLogs()" class="border rounded p-2 text-xs border-gray-300">
            <option value="all">All Gateways</option>
            <option value="selcom">Selcom</option>
            <option value="azampay">AzamPay</option>
          </select>
          
          <select x-model="payStatus" @change="fetchPaymentLogs()" class="border rounded p-2 text-xs border-gray-300">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          
          <button @click="fetchPaymentLogs()" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded border border-gray-300 flex items-center gap-1">
            <i class="fa-solid fa-filter"></i> Filter
          </button>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto justify-end">
          <button @click="exportLogs('csv')" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-file-csv"></i> CSV Export
          </button>
          <button @click="exportLogs('json')" class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-file-code"></i> JSON Export
          </button>
          <button @click="bulkRetryFailed()" class="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded text-xs font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-rotate"></i> Retry Failed
          </button>
          <button @click="bulkDeleteLogs('all')" class="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-trash-can"></i> Clear Logs
          </button>
        </div>
      </div>

      <!-- Payment Logs Table -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th class="py-3 px-4 text-left">Ref / Date</th>
              <th class="py-3 px-4 text-left">Gateway</th>
              <th class="py-3 px-4 text-left">Customer</th>
              <th class="py-3 px-4 text-left">Amount</th>
              <th class="py-3 px-4 text-left">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <template x-if="payLogs.length === 0">
              <tr><td colspan="6" class="text-center py-8 text-gray-400">No payment logs found</td></tr>
            </template>
            
            <template x-for="l in payLogs" :key="l.id">
              <tr class="hover:bg-gray-50 transition">
                <td class="py-3 px-4 font-mono">
                  <div class="font-bold text-gray-900" x-text="l.external_reference"></div>
                  <div class="text-[10px] text-gray-400" x-text="l.created_at"></div>
                </td>
                <td class="py-3 px-4">
                  <span :class="l.gateway === 'azampay' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'" class="uppercase font-semibold text-[10px] px-2 py-0.5 rounded" x-text="l.gateway"></span>
                </td>
                <td class="py-3 px-4" x-text="l.phone"></td>
                <td class="py-3 px-4 font-semibold" x-text="'TZS ' + Number(l.amount).toLocaleString()"></td>
                <td class="py-3 px-4">
                  <span :class="{
                    'bg-emerald-100 text-emerald-800': l.status === 'success',
                    'bg-rose-100 text-rose-800': l.status === 'failed',
                    'bg-amber-100 text-amber-800': l.status === 'pending'
                  }" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" x-text="l.status"></span>
                </td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button @click="openLogModal(l)" class="text-indigo-600 hover:text-indigo-900 font-medium px-2 py-1 bg-indigo-50 rounded">
                    Inspect
                  </button>
                  <button @click="testStatusCheckInline(l.external_reference)" class="text-blue-600 hover:text-blue-900 font-medium px-2 py-1 bg-blue-50 rounded">
                    Check Status
                  </button>
                  <template x-if="l.status === 'failed'">
                    <button @click="retryLog(l.id)" class="text-amber-600 hover:text-amber-900 font-medium px-2 py-1 bg-amber-50 rounded">Retry</button>
                  </template>
                  <button @click="deleteLog(l.id)" class="text-red-600 hover:text-red-900 font-medium px-2 py-1 bg-red-50 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center text-xs text-gray-500 pt-2">
        <div x-text="'Showing Page ' + payPage + ' of ' + payLastPage"></div>
        <div class="space-x-1">
          <button @click="payPage = Math.max(1, payPage - 1); fetchPaymentLogs()" class="px-3 py-1 bg-white border rounded">Previous</button>
          <button @click="payPage = Math.min(payLastPage, payPage + 1); fetchPaymentLogs()" class="px-3 py-1 bg-white border rounded">Next</button>
        </div>
      </div>
    </div>

    <!-- TAB 5: REQUEST INSPECTOR (INBOUND & OUTBOUND) -->
    <div x-show="activeTab === 'requests'" class="space-y-4">
      
      <!-- Top Monitor Bar -->
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3 w-full md:w-auto">
          <input type="text" x-model="reqSearch" @input.debounce.300ms="fetchRequestLogs()" placeholder="Filter URL, reference, body..." class="border rounded p-2 text-xs w-64 border-gray-300">
          
          <select x-model="reqDirection" @change="fetchRequestLogs()" class="border rounded p-2 text-xs border-gray-300">
            <option value="all">All Traffic (In & Out)</option>
            <option value="INBOUND">Inbound (Web App → Processor)</option>
            <option value="OUTBOUND">Outbound (Processor → Gateway/WebApp)</option>
          </select>

          <select x-model="reqStatus" @change="fetchRequestLogs()" class="border rounded p-2 text-xs border-gray-300">
            <option value="all">All HTTP Statuses</option>
            <option value="2xx">2xx Success</option>
            <option value="4xx">4xx Client Errors</option>
            <option value="5xx">5xx Server Errors</option>
          </select>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <label class="flex items-center gap-2 text-xs text-gray-600 font-medium cursor-pointer">
            <input type="checkbox" x-model="autoRefreshReqs" @change="toggleAutoRefresh()" class="rounded border-gray-300 text-indigo-600">
            <span>Live Auto-Refresh (3s)</span>
          </label>

          <button @click="fetchRequestLogs()" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-rotate-right"></i> Refresh
          </button>
          
          <button @click="bulkDeleteRequestLogs('all')" class="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-medium flex items-center gap-1.5">
            <i class="fa-solid fa-trash-can"></i> Clear Traffic Logs
          </button>
        </div>
      </div>

      <!-- Request Logs Table -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th class="py-3 px-4 text-left">Time / ID</th>
              <th class="py-3 px-4 text-left">Direction</th>
              <th class="py-3 px-4 text-left">Method & Path</th>
              <th class="py-3 px-4 text-left">Status</th>
              <th class="py-3 px-4 text-left">Latency</th>
              <th class="py-3 px-4 text-left">Reference</th>
              <th class="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <template x-if="reqLogs.length === 0">
              <tr><td colspan="7" class="text-center py-8 text-gray-400">No HTTP request traffic recorded yet. Make requests from Web App or Emulator to view live logs.</td></tr>
            </template>
            
            <template x-for="req in reqLogs" :key="req.id">
              <tr class="hover:bg-gray-50 transition cursor-pointer" @click="inspectRequest(req)">
                <td class="py-2.5 px-4 font-mono">
                  <div class="font-bold text-gray-800 text-[11px]" x-text="req.request_id"></div>
                  <div class="text-[10px] text-gray-400" x-text="req.created_at"></div>
                </td>
                
                <td class="py-2.5 px-4">
                  <template x-if="req.direction === 'INBOUND'">
                    <span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 w-max">
                      <i class="fa-solid fa-arrow-down-left-and-arrow-up-right text-[9px]"></i> INBOUND
                    </span>
                  </template>
                  <template x-if="req.direction === 'OUTBOUND'">
                    <span class="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 w-max">
                      <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i> OUTBOUND
                    </span>
                  </template>
                </td>

                <td class="py-2.5 px-4 font-mono max-w-xs truncate">
                  <span :class="{
                    'text-emerald-700 bg-emerald-50': req.method === 'GET',
                    'text-blue-700 bg-blue-50': req.method === 'POST',
                    'text-amber-700 bg-amber-50': req.method === 'PUT' || req.method === 'PATCH',
                    'text-rose-700 bg-rose-50': req.method === 'DELETE'
                  }" class="font-bold px-1.5 py-0.5 rounded text-[10px] mr-1" x-text="req.method"></span>
                  <span class="text-gray-900 font-medium" x-text="req.path"></span>
                </td>

                <td class="py-2.5 px-4 font-mono">
                  <span :class="{
                    'bg-emerald-100 text-emerald-800': req.status_code >= 200 && req.status_code < 300,
                    'bg-amber-100 text-amber-800': req.status_code >= 400 && req.status_code < 500,
                    'bg-rose-100 text-rose-800': req.status_code >= 500 || !req.status_code
                  }" class="px-2 py-0.5 rounded text-[10px] font-bold" x-text="req.status_code || 'ERR'"></span>
                </td>

                <td class="py-2.5 px-4 font-mono text-gray-500" x-text="(req.duration_ms || 0) + ' ms'"></td>

                <td class="py-2.5 px-4 font-mono text-gray-700 font-medium" x-text="req.external_reference || '-'"></td>

                <td class="py-2.5 px-4 text-right">
                  <button class="text-indigo-600 hover:text-indigo-900 font-medium px-2.5 py-1 bg-indigo-50 rounded">
                    Inspect payload
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Traffic Stats Footer -->
      <div class="flex justify-between items-center text-xs text-gray-500 pt-2">
        <div x-text="'Total recorded requests: ' + reqTotal"></div>
        <div class="flex gap-2">
          <button @click="reqPage = Math.max(1, reqPage - 1); fetchRequestLogs()" class="px-3 py-1 bg-white border rounded">Previous</button>
          <span class="py-1 px-2 font-medium" x-text="'Page ' + reqPage + ' of ' + reqLastPage"></span>
          <button @click="reqPage = Math.min(reqLastPage, reqPage + 1); fetchRequestLogs()" class="px-3 py-1 bg-white border rounded">Next</button>
        </div>
      </div>
    </div>

    <!-- TAB 6: INTERACTIVE STATUS CHECKER TOOL -->
    <div x-show="activeTab === 'status_checker'" class="space-y-6">
      <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 class="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <i class="fa-solid fa-magnifying-glass-chart text-emerald-600"></i> Payment Status Checker & Live Azam Poll
        </h2>
        <p class="text-xs text-gray-600 mb-6">
          Enter an <strong>external_reference</strong> from your web app. The processor will inspect local DB status; if status is <code>pending</code>, it automatically contacts AzamPay/Selcom API, updates the database, forwards webhook callbacks, and returns real-time feedback.
        </p>

        <div class="flex flex-col md:flex-row gap-3 max-w-xl mb-6">
          <input type="text" x-model="testRef" placeholder="e.g. INV-2026-881" class="flex-1 rounded-md border-gray-300 border p-2.5 text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500">
          <button @click="runInteractiveStatusCheck()" :disabled="checkingStatus" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-md shadow transition flex items-center justify-center gap-2">
            <i class="fa-solid" :class="checkingStatus ? 'fa-spinner fa-spin' : 'fa-play'"></i>
            <span x-text="checkingStatus ? 'Polling Gateway...' : 'Check Status Live'"></span>
          </button>
        </div>

        <!-- Live Step Execution Trace -->
        <template x-if="statusTrace.length > 0">
          <div class="mb-6 bg-slate-950 text-slate-100 rounded-lg p-5 font-mono text-xs shadow-inner">
            <div class="text-slate-400 font-bold border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
              <span><i class="fa-solid fa-terminal text-indigo-400 mr-2"></i> LIVE EXECUTION TRACE LOG</span>
              <span class="text-[10px] text-indigo-400 font-sans">Real-time status check engine</span>
            </div>

            <div class="space-y-2">
              <template x-for="t in statusTrace" :key="t.step">
                <div class="flex items-start gap-3">
                  <span class="text-indigo-400 font-bold" x-text="'[' + t.step + ']'"></span>
                  <div>
                    <span class="text-emerald-400 font-bold" x-text="t.name + ':'"></span>
                    <span class="text-slate-300" x-text="t.detail"></span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Final WebApp Feedback JSON Result -->
        <template x-if="statusResult">
          <div class="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Feedback Payload Returned to Web App</h3>
              <span :class="{
                'bg-emerald-100 text-emerald-800': statusResult.status === 'success',
                'bg-rose-100 text-rose-800': statusResult.status === 'failed',
                'bg-amber-100 text-amber-800': statusResult.status === 'pending'
              }" class="px-2.5 py-0.5 rounded text-xs font-bold" x-text="statusResult.status ? statusResult.status.toUpperCase() : 'NOT FOUND'"></span>
            </div>

            <pre class="bg-slate-900 text-emerald-400 p-4 rounded font-mono text-xs overflow-x-auto" x-text="JSON.stringify(statusResult, null, 2)"></pre>
          </div>
        </template>
      </div>
    </div>

    <!-- MODAL 1: INSPECT PAYMENT LOG -->
    <div x-show="showModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" x-cloak>
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h3 class="font-bold text-gray-900 text-sm">Payment Transaction Details</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 font-mono text-xs">
          <template x-if="modalLog">
            <div>
              <div class="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded border">
                <div><strong>External Ref:</strong> <span x-text="modalLog.external_reference"></span></div>
                <div><strong>Gateway Ref:</strong> <span x-text="modalLog.gateway_reference || 'N/A'"></span></div>
                <div><strong>Gateway:</strong> <span class="uppercase font-bold" x-text="modalLog.gateway"></span></div>
                <div><strong>Amount:</strong> TZS <span x-text="modalLog.amount"></span></div>
                <div><strong>Phone:</strong> <span x-text="modalLog.phone"></span></div>
                <div><strong>Status:</strong> <span class="uppercase font-bold" x-text="modalLog.status"></span></div>
              </div>

              <div class="space-y-3">
                <div>
                  <div class="font-bold text-gray-700 mb-1">Raw Request Payload:</div>
                  <pre class="bg-gray-900 text-emerald-400 p-3 rounded overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.raw_request, null, 2)"></pre>
                </div>
                <div>
                  <div class="font-bold text-gray-700 mb-1">Gateway Initiation Response:</div>
                  <pre class="bg-gray-900 text-blue-400 p-3 rounded overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.raw_response, null, 2)"></pre>
                </div>
                <div>
                  <div class="font-bold text-gray-700 mb-1">Webhook Callback Received:</div>
                  <pre class="bg-gray-900 text-purple-400 p-3 rounded overflow-x-auto text-[11px]" x-text="JSON.stringify(modalLog.callback_payload, null, 2)"></pre>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button @click="showModal = false" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: INSPECT HTTP REQUEST LOG -->
    <div x-show="showReqModal" class="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4" x-cloak>
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-900 text-white rounded-t-lg">
          <div class="flex items-center gap-3">
            <span :class="selectedReq?.direction === 'INBOUND' ? 'bg-blue-600' : 'bg-purple-600'" class="px-2.5 py-1 rounded text-xs font-bold" x-text="selectedReq?.direction"></span>
            <span class="font-mono text-sm font-bold" x-text="selectedReq?.method + ' ' + selectedReq?.path"></span>
          </div>
          <button @click="showReqModal = false" class="text-gray-400 hover:text-white font-bold text-xl">&times;</button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 font-mono text-xs bg-slate-50">
          <template x-if="selectedReq">
            <div class="space-y-4">
              <!-- Meta summary -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded border border-gray-200">
                <div><span class="text-gray-400 block text-[10px]">REQUEST ID</span><span class="font-bold text-gray-900" x-text="selectedReq.request_id"></span></div>
                <div><span class="text-gray-400 block text-[10px]">HTTP STATUS</span><span class="font-bold" :class="selectedReq.status_code >= 400 ? 'text-red-600' : 'text-emerald-600'" x-text="selectedReq.status_code || 'ERR'"></span></div>
                <div><span class="text-gray-400 block text-[10px]">LATENCY</span><span class="font-bold text-gray-900" x-text="selectedReq.duration_ms + ' ms'"></span></div>
                <div><span class="text-gray-400 block text-[10px]">EXTERNAL REF</span><span class="font-bold text-indigo-600" x-text="selectedReq.external_reference || 'N/A'"></span></div>
              </div>

              <!-- Request Headers & Body -->
              <div class="bg-white p-4 rounded border border-gray-200 space-y-3">
                <div class="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Request Headers & Body</div>
                <div>
                  <div class="text-[10px] font-bold text-gray-500 mb-1">HEADERS:</div>
                  <pre class="bg-slate-900 text-slate-300 p-3 rounded text-[11px] overflow-x-auto" x-text="JSON.stringify(selectedReq.headers, null, 2)"></pre>
                </div>
                <div>
                  <div class="text-[10px] font-bold text-gray-500 mb-1">REQUEST PAYLOAD:</div>
                  <pre class="bg-slate-900 text-emerald-400 p-3 rounded text-[11px] overflow-x-auto" x-text="typeof selectedReq.request_body === 'object' ? JSON.stringify(selectedReq.request_body, null, 2) : (selectedReq.request_body || '[No Body]')"></pre>
                </div>
              </div>

              <!-- Response Headers & Body -->
              <div class="bg-white p-4 rounded border border-gray-200 space-y-3">
                <div class="text-xs font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Response Body</div>
                <div>
                  <pre class="bg-slate-900 text-blue-400 p-3 rounded text-[11px] overflow-x-auto" x-text="typeof selectedReq.response_body === 'object' ? JSON.stringify(selectedReq.response_body, null, 2) : (selectedReq.response_body || '[No Response Body]')"></pre>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="px-6 py-3 border-t bg-white flex justify-end">
          <button @click="showReqModal = false" class="px-4 py-2 bg-gray-800 text-white text-xs font-medium rounded hover:bg-gray-900">
            Close Inspector
          </button>
        </div>
      </div>
    </div>

  </div>

  <script>
    function configDashboard() {
      return {
        activeTab: new URLSearchParams(window.location.search).get('tab') || 'general',
        showModal: false,
        modalLog: null,
        saving: false,
        testing: false,

        // Toast state
        toast: { show: false, type: 'info', title: '', message: '' },

        // Form state
        form: {
          environment_mode: '${envMode}',
          active_gateway: '${activeGateway}',
          webapp_callback_url: '${webappCallbackUrl}',
          
          live_azampay_base_url: '${liveAzamBaseUrl}',
          live_azampay_auth_base_url: '${liveAzamAuthBaseUrl}',
          live_azampay_app_name: '${liveAzamAppName}',
          live_azampay_client_id: '${liveAzamClientId}',
          live_azampay_client_secret: '${liveAzamClientSecret}',
          live_azampay_api_key: '${liveAzamApiKey}',

          sandbox_azampay_base_url: '${sandboxAzamBaseUrl}',
          sandbox_azampay_auth_base_url: '${sandboxAzamAuthBaseUrl}',
          sandbox_azampay_app_name: '${sandboxAzamAppName}',
          sandbox_azampay_client_id: '${sandboxAzamClientId}',
          sandbox_azampay_client_secret: '${sandboxAzamClientSecret}',
          sandbox_azampay_api_key: '${sandboxAzamApiKey}',

          live_selcom_base_url: '${liveSelcomBaseUrl}',
          live_selcom_vendor: '${liveSelcomVendor}',
          live_selcom_api_key: '${liveSelcomApiKey}',
          live_selcom_secret_key: '${liveSelcomSecretKey}',

          sandbox_selcom_base_url: '${sandboxSelcomBaseUrl}',
          sandbox_selcom_vendor: '${sandboxSelcomVendor}',
          sandbox_selcom_api_key: '${sandboxSelcomApiKey}',
          sandbox_selcom_secret_key: '${sandboxSelcomSecretKey}',
        },

        // Payment Logs state
        payLogs: ${JSON.stringify(initialLogs)},
        payTotal: ${initialTotalLogs},
        payPage: ${initialCurrentPage},
        payLastPage: ${initialLastPage},
        paySearch: '${searchVal}',
        payGateway: '${gatewayFilter}',
        payStatus: '${statusFilter}',

        // Request Inspector state
        reqLogs: [],
        reqTotal: 0,
        reqPage: 1,
        reqLastPage: 1,
        reqSearch: '',
        reqDirection: 'all',
        reqStatus: 'all',
        autoRefreshReqs: false,
        refreshTimer: null,
        showReqModal: false,
        selectedReq: null,

        // Status Checker Tool state
        testRef: '',
        checkingStatus: false,
        statusResult: null,
        statusTrace: [],

        initDashboard() {
          if (this.activeTab === 'requests') {
            this.fetchRequestLogs();
          } else if (this.activeTab === 'logs') {
            this.fetchPaymentLogs();
          }
        },

        showToast(type, title, message) {
          this.toast = { show: true, type, title, message };
          setTimeout(() => {
            this.toast.show = false;
          }, 4500);
        },

        async saveConfig() {
          this.saving = true;
          try {
            const res = await fetch('/config/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(this.form),
            });
            const data = await res.json();
            if (data.success) {
              this.showToast('success', 'Configurations Saved', data.message || 'System settings updated successfully.');
            } else {
              this.showToast('error', 'Save Failed', data.message || 'Could not save configurations.');
            }
          } catch (e) {
            this.showToast('error', 'Error', e.message);
          } finally {
            this.saving = false;
          }
        },

        async testConnection(testGatewayKey) {
          this.testing = true;
          this.showToast('info', 'Testing Connection', 'Contacting gateway API endpoint...');
          try {
            const payload = { ...this.form, test_gateway: testGatewayKey };
            const res = await fetch('/config/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            this.showToast(data.type || (data.success ? 'success' : 'error'), data.success ? 'Connection Successful' : 'Connection Result', data.message);
          } catch (e) {
            this.showToast('error', 'Network Error', e.message);
          } finally {
            this.testing = false;
          }
        },

        autoFillSandboxAzam() {
          const origin = window.location.origin;
          this.form.sandbox_azampay_base_url = origin + '/api/emulator/azampay';
          this.form.sandbox_azampay_auth_base_url = origin + '/api/emulator/azampay';
          this.form.sandbox_azampay_app_name = 'EmulatorApp';
          this.form.sandbox_azampay_client_id = 'emulator_client_id';
          this.form.sandbox_azampay_client_secret = 'emulator_secret';
          this.form.sandbox_azampay_api_key = 'emulator_api_key';
          this.showToast('info', 'Emulator Endpoints Set', 'Sandbox AzamPay pointed to local emulator. Click Save to apply.');
        },

        autoFillSandboxSelcom() {
          const origin = window.location.origin;
          this.form.sandbox_selcom_base_url = origin + '/api/emulator/selcom';
          this.form.sandbox_selcom_vendor = 'EMU_TILL_123';
          this.form.sandbox_selcom_api_key = 'emulator_api_key';
          this.form.sandbox_selcom_secret_key = 'emulator_secret';
          this.showToast('info', 'Emulator Endpoints Set', 'Sandbox Selcom pointed to local emulator. Click Save to apply.');
        },

        async fetchPaymentLogs() {
          try {
            const url = '/api/v1/logs?page=' + this.payPage + 
              '&search=' + encodeURIComponent(this.paySearch) + 
              '&gateway=' + this.payGateway + 
              '&status=' + this.payStatus;
            
            const res = await fetch(url);
            const data = await res.json();
            this.payLogs = data.data || [];
            this.payTotal = data.total || 0;
            this.payLastPage = data.last_page || 1;
          } catch (e) {
            console.error('Failed to fetch payment logs:', e);
          }
        },

        async fetchRequestLogs() {
          try {
            const url = '/requests?page=' + this.reqPage + 
              '&search=' + encodeURIComponent(this.reqSearch) + 
              '&direction=' + this.reqDirection + 
              '&status=' + this.reqStatus;
            
            const res = await fetch(url);
            const data = await res.json();
            this.reqLogs = data.data || [];
            this.reqTotal = data.total || 0;
            this.reqLastPage = data.last_page || 1;
          } catch (e) {
            console.error('Failed to fetch request logs:', e);
          }
        },

        toggleAutoRefresh() {
          if (this.autoRefreshReqs) {
            this.refreshTimer = setInterval(() => {
              if (this.activeTab === 'requests') {
                this.fetchRequestLogs();
              }
            }, 3000);
          } else {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
          }
        },

        inspectRequest(req) {
          this.selectedReq = req;
          this.showReqModal = true;
        },

        openLogModal(log) {
          this.modalLog = log;
          this.showModal = true;
        },

        async runInteractiveStatusCheck() {
          if (!this.testRef.trim()) {
            this.showToast('error', 'Validation Error', 'Please enter an external_reference');
            return;
          }

          this.checkingStatus = true;
          this.statusResult = null;
          this.statusTrace = [];

          try {
            const res = await fetch('/check-status-interactive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ external_reference: this.testRef.trim() }),
            });
            const data = await res.json();
            this.statusResult = data;
            this.statusTrace = data.trace || [];
            this.fetchPaymentLogs();
          } catch (e) {
            this.showToast('error', 'Status Check Failed', e.message);
          } finally {
            this.checkingStatus = false;
          }
        },

        testStatusCheckInline(ref) {
          this.testRef = ref;
          this.activeTab = 'status_checker';
          this.runInteractiveStatusCheck();
        },

        async retryLog(id) {
          if (!confirm('Retry this payment transaction?')) return;
          try {
            const res = await fetch('/logs/retry/' + id, { method: 'POST' });
            const data = await res.json();
            this.showToast(data.success ? 'success' : 'error', 'Retry Result', data.message);
            this.fetchPaymentLogs();
          } catch (e) {
            this.showToast('error', 'Retry Failed', e.message);
          }
        },

        async deleteLog(id) {
          if (!confirm('Are you sure you want to delete this log?')) return;
          try {
            const res = await fetch('/logs/' + id, { method: 'DELETE' });
            const data = await res.json();
            this.showToast('success', 'Log Deleted', data.message || 'Log deleted successfully.');
            this.fetchPaymentLogs();
          } catch (e) {
            this.showToast('error', 'Delete Failed', e.message);
          }
        },

        async bulkDeleteLogs(type) {
          if (!confirm('Clear payment transaction logs?')) return;
          try {
            const res = await fetch('/logs/bulk-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type }),
            });
            const data = await res.json();
            this.showToast('success', 'Logs Cleared', data.message || 'Payment logs cleared.');
            this.fetchPaymentLogs();
          } catch (e) {
            this.showToast('error', 'Clear Failed', e.message);
          }
        },

        async bulkDeleteRequestLogs(type) {
          if (!confirm('Clear HTTP traffic request logs?')) return;
          try {
            const res = await fetch('/requests/bulk-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type }),
            });
            const data = await res.json();
            this.showToast('success', 'Traffic Cleared', data.message || 'Traffic logs cleared.');
            this.fetchRequestLogs();
          } catch (e) {
            this.showToast('error', 'Clear Failed', e.message);
          }
        },

        async bulkRetryFailed() {
          if (!confirm('Retry all failed payment transactions?')) return;
          try {
            const res = await fetch('/logs/bulk-retry', { method: 'POST' });
            const data = await res.json();
            this.showToast('success', 'Bulk Retry', data.message);
            this.fetchPaymentLogs();
          } catch (e) {
            this.showToast('error', 'Bulk Retry Failed', e.message);
          }
        },

        exportLogs(format) {
          window.location.href = '/logs/export?format=' + format;
        }
      };
    }
  </script>
  `;

  return renderLayout({ title: 'Control Panel & Gateway Panels', activeTab: 'config', content, flashMessage });
}

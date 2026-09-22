import { renderLayout } from './layout.js';

export function renderSelcomPayView(transaction, orderId) {
  const content = `
  <div class="max-w-md mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
    <div class="bg-gray-800 px-6 py-4 text-white flex justify-between items-center">
      <div>
        <h2 class="font-semibold text-base">Selcom Payment Checkout</h2>
        <p class="text-xs text-gray-300">Sandbox Payment Simulation</p>
      </div>
      <div class="bg-white/10 px-2.5 py-1 rounded text-xs font-mono font-bold">
        SELCOM
      </div>
    </div>

    <div class="p-6 space-y-6">
      ${
        transaction
          ? `
      <div class="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-xs">
        <div class="flex justify-between"><span class="text-gray-500">Order Reference:</span> <span class="font-mono font-semibold">${transaction.external_id}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Customer Name:</span> <span class="font-semibold">${transaction.buyer_name || 'Customer'}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Customer Phone:</span> <span>${transaction.phone}</span></div>
        <div class="flex justify-between border-t border-gray-200 pt-2 text-sm font-semibold"><span class="text-gray-700">Total Amount:</span> <span class="text-gray-900">TZS ${Number(transaction.amount).toLocaleString()}</span></div>
      </div>

      ${
        transaction.status === 'pending'
          ? `
      <div class="space-y-3" x-data="{ loading: false }">
        <p class="text-xs text-gray-500 text-center">Simulate customer checkout action:</p>
        <button @click="loading = true; resolve('${transaction.id}', 'approve')" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow-sm transition text-xs">
          Pay Now (Simulate Success)
        </button>
        <button @click="loading = true; resolve('${transaction.id}', 'reject')" class="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded border border-gray-300 transition text-xs">
          Cancel Payment (Simulate Failure)
        </button>
      </div>`
          : `
      <div class="bg-green-50 border border-green-200 text-green-800 p-4 rounded text-center text-xs font-medium">
        Payment processed with status: ${transaction.status}
      </div>`
      }
      `
          : `
      <div class="text-center py-6 text-red-600 text-xs font-medium">
        Order ${orderId} not found in database.
      </div>`
      }
    </div>
  </div>

  <script>
    async function resolve(id, action) {
      const res = await fetch('/api/emulator/resolve/' + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment simulated: ' + action);
        window.location.href = '/emulator';
      } else {
        alert(data.error || 'Failed to simulate payment');
      }
    }
  </script>`;

  return renderLayout({ title: 'Selcom Sandbox Checkout', activeTab: 'emulator', content });
}

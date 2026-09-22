export function renderLayout({ title, activeTab, content, flashMessage }) {
  const flashHtml = flashMessage
    ? `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div class="rounded-md ${
        flashMessage.type === 'error'
          ? 'bg-red-50 border border-red-200 p-4 text-red-700'
          : 'bg-green-50 border border-green-200 p-4 text-green-700'
      } text-sm">
        <p class="font-medium">${flashMessage.text}</p>
      </div>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Payment Processor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="h-full font-sans antialiased text-gray-800 flex flex-col min-h-screen bg-white">
  
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            PP
          </div>
          <span class="font-semibold text-lg text-gray-900">Payment Processor Middleware</span>
        </div>
        <nav class="flex space-x-4">
          <a href="/" class="px-3 py-2 text-sm font-medium rounded-md transition ${
            activeTab === 'config'
              ? 'bg-gray-100 text-gray-900 font-semibold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }">Configurations &amp; Logs</a>
          <a href="/emulator" class="px-3 py-2 text-sm font-medium rounded-md transition ${
            activeTab === 'emulator'
              ? 'bg-gray-100 text-gray-900 font-semibold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }">Emulator Sandbox</a>
        </nav>
      </div>
    </div>
  </header>

  ${flashHtml}

  <main class="flex-1 py-6 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      ${content}
    </div>
  </main>

  <footer class="bg-white border-t border-gray-200 py-4 mt-auto">
    <div class="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
      Payment Processor Middleware &copy; ${new Date().getFullYear()}
    </div>
  </footer>
</body>
</html>`;
}

export function renderLayout(opts = {}, legacyContent = null, legacyFlash = null) {
  let title, activeTab, content, flashMessage, adminUser;
  if (typeof opts === 'string') {
    title = opts;
    content = legacyContent || '';
    flashMessage = legacyFlash || null;
    activeTab = 'config';
    adminUser = null;
  } else {
    title = opts.title || 'Payment Processor';
    activeTab = opts.activeTab || 'config';
    content = opts.content || '';
    flashMessage = opts.flashMessage || null;
    adminUser = opts.adminUser || null;
  }

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

  const userControlsHtml = adminUser
    ? `
    <div class="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
      <span class="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium border border-gray-200" title="Logged in as Admin">
        <i class="fa-solid fa-user-shield text-indigo-600"></i> ${adminUser}
      </span>
      <a href="/logout" class="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md transition font-medium border border-red-100 flex items-center gap-1">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </a>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Payment Processor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>[x-cloak] { display: none !important; }</style>
</head>
<body class="h-full font-sans antialiased text-gray-800 flex flex-col min-h-screen bg-gray-50">
  
  <header class="bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
            PP
          </div>
          <span class="font-bold text-lg text-gray-900">Payment Processor Middleware</span>
        </div>
        <div class="flex items-center">
          <nav class="flex space-x-4">
            <a href="/" class="px-3.5 py-2 text-sm font-medium rounded-md transition ${
              activeTab === 'config'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }">Configurations &amp; Gateway Panels</a>
            <a href="/emulator" class="px-3.5 py-2 text-sm font-medium rounded-md transition ${
              activeTab === 'emulator'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }">Emulator Sandbox</a>
          </nav>
          ${userControlsHtml}
        </div>
      </div>
    </div>
  </header>

  ${flashHtml}

  <main class="flex-1 py-6">
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

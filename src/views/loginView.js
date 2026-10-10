export function renderLoginView(opts = {}) {
  const error = opts.error || null;
  const redirect = opts.redirect || '/';
  const usernameVal = opts.username || '';

  const errorHtml = error
    ? `
    <div class="mb-5 rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center gap-3">
      <i class="fa-solid fa-triangle-exclamation text-red-500 text-lg flex-shrink-0"></i>
      <div class="font-medium">${error}</div>
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Payment Processor Middleware</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="h-full font-sans antialiased text-gray-800 flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
  
  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
    <div>
      <div class="mx-auto w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
        PP
      </div>
      <h2 class="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
        Payment Processor Dashboard
      </h2>
      <p class="mt-1 text-center text-sm text-gray-500">
        Sign in with your admin credentials to access settings and logs.
      </p>
    </div>

    ${errorHtml}

    <form class="mt-6 space-y-5" action="/login" method="POST">
      <input type="hidden" name="redirect" value="${redirect}" />
      
      <div>
        <label for="username" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
          Username
        </label>
        <div class="relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <i class="fa-solid fa-user text-sm"></i>
          </div>
          <input 
            id="username" 
            name="username" 
            type="text" 
            required 
            value="${usernameVal}"
            placeholder="admin"
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
          Password
        </label>
        <div class="relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <i class="fa-solid fa-lock text-sm"></i>
          </div>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            placeholder="••••••••"
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
        >
          <i class="fa-solid fa-right-to-bracket"></i> Sign In to Dashboard
        </button>
      </div>
    </form>

    <div class="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
      Payment Processor Middleware &copy; ${new Date().getFullYear()}
    </div>
  </div>

</body>
</html>`;
}

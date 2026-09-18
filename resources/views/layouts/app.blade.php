<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', config('app.name', 'Payment Processor Platform'))</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Styles / Scripts -->
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @endif

    <style>
        :root {
            --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }

        body {
            font-family: var(--font-sans);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .font-mono {
            font-family: var(--font-mono);
        }

        /* Custom refined scrollbars */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.05);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.4);
            border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 0.6);
        }

        /* Base utility overrides if Vite Tailwind fails */
        .bg-slate-900 { background-color: #0f172a; }
        .bg-slate-800 { background-color: #1e293b; }
        .bg-slate-50 { background-color: #f8fafc; }
        .border-slate-200 { border-color: #e2e8f0; }
        .border-slate-700 { border-color: #334155; }
        .text-slate-900 { color: #0f172a; }
        .text-slate-600 { color: #475569; }
        .text-slate-400 { color: #94a3b8; }
    </style>

    @stack('styles')
</head>
<body class="h-full bg-slate-50 text-slate-900 antialiased flex flex-col min-h-screen">
    <!-- Platform Top Bar Header -->
    <header class="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                
                <!-- Brand & Logo -->
                <div class="flex items-center space-x-3">
                    <a href="{{ route('config.index') }}" class="flex items-center space-x-3 group">
                        <div class="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" />
                            </svg>
                        </div>
                        <div>
                            <span class="font-bold text-base tracking-tight text-white block leading-none">Payment Operations</span>
                            <span class="text-xs text-slate-400 font-mono mt-1 block">Unified Gateway Hub</span>
                        </div>
                    </a>
                </div>

                <!-- Navigation Tabs -->
                <nav class="hidden md:flex items-center space-x-1">
                    <a href="{{ route('config.index') }}" 
                       class="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 {{ request()->routeIs('config.index') && !request()->has('tab') ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/60' }}">
                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75" />
                        </svg>
                        <span>Gateway Settings</span>
                    </a>

                    <a href="{{ route('emulator.index') }}" 
                       class="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 {{ request()->routeIs('emulator.*') ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/60' }}">
                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                        <span>Developer Sandbox</span>
                    </a>
                </nav>

                <!-- Status Badge & Environment -->
                <div class="flex items-center space-x-3">
                    @php
                        $activeGw = strtoupper(\App\Models\Config::getValue('active_gateway', 'SELCOM'));
                    @endphp
                    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                        <span class="w-2 h-2 rounded-full {{ $activeGw === 'SELCOM' ? 'bg-emerald-400' : 'bg-indigo-400' }} animate-pulse"></span>
                        <span class="text-slate-400 font-normal">Active Driver:</span>
                        <span class="font-mono font-bold text-white">{{ $activeGw }}</span>
                    </div>

                    <span class="hidden lg:inline-flex px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        v{{ app()->version() }}
                    </span>
                </div>

            </div>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-2">
                <span class="font-semibold text-slate-700">Payment Processor Platform</span>
                <span>&bull;</span>
                <span>Enterprise Mobile Money & Gateway Integration Core</span>
            </div>
            <div class="flex items-center space-x-4">
                <a href="{{ route('config.index') }}" class="hover:text-slate-800 transition-colors">Configuration</a>
                <a href="{{ route('emulator.index') }}" class="hover:text-slate-800 transition-colors">Sandbox Emulator</a>
                <a href="{{ route('logs.index') }}" class="hover:text-slate-800 transition-colors">Audit Logs</a>
            </div>
        </div>
    </footer>

    @stack('scripts')
</body>
</html>

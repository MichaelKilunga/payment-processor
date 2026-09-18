@extends('layouts.app')

@section('title', 'Payment Gateway Control Panel — Settings & Audit Logs')

@section('content')
<div class="py-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header & Title Section -->
        <div class="md:flex md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200">
            <div class="min-w-0 flex-1">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                        <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Gateway Management & Operations
                        </h1>
                        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Configure mobile money providers, manage webhook routes, and inspect transaction telemetry.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Quick Navigation Action Bar -->
            <div class="mt-4 md:mt-0 flex items-center space-x-3">
                <a href="{{ route('emulator.index') }}" 
                   class="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    <span>Launch Sandbox Emulator</span>
                </a>
            </div>
        </div>

        <!-- Session Feedback Alerts -->
        @if(session('success'))
            <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-3 shadow-sm">
                <svg class="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm font-medium">{{ session('success') }}</div>
            </div>
        @endif

        @if(session('error'))
            <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 shadow-sm">
                <svg class="w-5 h-5 text-rose-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div class="text-sm font-medium">{{ session('error') }}</div>
            </div>
        @endif

        <!-- Segmented Tab Navigation -->
        <div class="mb-6 border-b border-slate-200">
            <nav class="flex space-x-8" aria-label="Tabs">
                <button type="button" 
                        onclick="switchTab('config-tab')" 
                        id="tab-btn-config-tab"
                        class="tab-btn active border-b-2 border-slate-900 py-3 px-1 text-sm font-semibold text-slate-900 flex items-center space-x-2">
                    <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Gateway Credentials</span>
                </button>

                <button type="button" 
                        onclick="switchTab('logs-tab')" 
                        id="tab-btn-logs-tab"
                        class="tab-btn border-b-2 border-transparent py-3 px-1 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:border-slate-300 flex items-center space-x-2">
                    <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M3.75 4.5h16.5m-16.5 3.75h16.5" />
                    </svg>
                    <span>Transaction Audit Logs</span>
                    <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-mono bg-slate-200 text-slate-700">{{ $logs->total() }}</span>
                </button>
            </nav>
        </div>

        <!-- ==================== TAB 1: GATEWAY CONFIGURATIONS ==================== -->
        <div id="config-tab" class="tab-panel space-y-8">
            <form action="{{ route('config.save') }}" method="POST" id="configForm">
                @csrf

                <!-- 1. Driver & System Callback Section -->
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                    <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center space-x-2">
                        <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m-19.5 0a4.5 4.5 0 00.9 2.7" />
                        </svg>
                        <span>Active Payment Gateway & System Webhook</span>
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Active Driver Selector -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                Primary Payment Gateway Driver
                            </label>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="cursor-pointer">
                                    <input type="radio" name="active_gateway" value="selcom" class="peer sr-only" {{ ($configs['active_gateway'] ?? 'selcom') === 'selcom' ? 'checked' : '' }}>
                                    <div class="p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-emerald-500 peer-checked:bg-emerald-50/40 peer-checked:text-emerald-900 transition-all text-center">
                                        <div class="font-bold text-sm">SELCOM</div>
                                        <div class="text-xs text-slate-500 mt-1">Order Checkout URL</div>
                                    </div>
                                </label>

                                <label class="cursor-pointer">
                                    <input type="radio" name="active_gateway" value="azampay" class="peer sr-only" {{ ($configs['active_gateway'] ?? '') === 'azampay' ? 'checked' : '' }}>
                                    <div class="p-4 rounded-xl border-2 border-slate-200 bg-white peer-checked:border-indigo-500 peer-checked:bg-indigo-50/40 peer-checked:text-indigo-900 transition-all text-center">
                                        <div class="font-bold text-sm">AZAMPAY</div>
                                        <div class="text-xs text-slate-500 mt-1">Direct USSD Push</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Webapp Callback URL -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2" for="webapp_callback_url">
                                WebApp Callback Webhook URL
                            </label>
                            <div class="relative">
                                <input type="url" 
                                       name="webapp_callback_url" 
                                       id="webapp_callback_url" 
                                       value="{{ $configs['webapp_callback_url'] ?? '' }}"
                                       placeholder="https://your-domain.com/api/payment/callback"
                                       class="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all">
                                <button type="button" 
                                        onclick="copyToClipboard('webapp_callback_url')"
                                        class="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-700" 
                                        title="Copy URL">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                                    </svg>
                                </button>
                            </div>
                            <p class="text-xs text-slate-500 mt-1.5">Where completed transaction status updates will be forwarded.</p>
                        </div>
                    </div>
                </div>

                <!-- 2. Gateway Provider Credentials Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <!-- SELCOM CONFIG CARD -->
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <div class="flex items-center space-x-2">
                                <div class="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                    SEL
                                </div>
                                <div>
                                    <h3 class="font-bold text-slate-900 text-base">Selcom Pay Credentials</h3>
                                    <span class="text-xs text-slate-500">Checkout Minimal Order API Integration</span>
                                </div>
                            </div>
                            <button type="submit" 
                                    name="test_gateway" 
                                    value="selcom" 
                                    class="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center space-x-1.5">
                                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                </svg>
                                <span>Test Connection</span>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1" for="selcom_base_url">Selcom Base URL</label>
                                <input type="text" name="selcom_base_url" id="selcom_base_url" value="{{ $configs['selcom_base_url'] ?? '' }}" placeholder="https://apigw.selcompay.com/v1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1" for="selcom_vendor">Selcom Vendor ID (Till ID)</label>
                                <input type="text" name="selcom_vendor" id="selcom_vendor" value="{{ $configs['selcom_vendor'] ?? '' }}" placeholder="TILL12345" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1" for="selcom_api_key">API Key</label>
                                <input type="text" name="selcom_api_key" id="selcom_api_key" value="{{ $configs['selcom_api_key'] ?? '' }}" placeholder="API-Key-XXXXXX" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1" for="selcom_secret_key">Secret Key</label>
                                <input type="password" name="selcom_secret_key" id="selcom_secret_key" value="{{ $configs['selcom_secret_key'] ?? '' }}" placeholder="••••••••••••••••" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                            </div>
                        </div>
                    </div>

                    <!-- AZAMPAY CONFIG CARD -->
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <div class="flex items-center space-x-2">
                                <div class="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    AZM
                                </div>
                                <div>
                                    <h3 class="font-bold text-slate-900 text-base">AzamPay Credentials</h3>
                                    <span class="text-xs text-slate-500">USSD Push & OAuth Token API Integration</span>
                                </div>
                            </div>
                            <button type="submit" 
                                    name="test_gateway" 
                                    value="azampay" 
                                    class="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center space-x-1.5">
                                <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                                </svg>
                                <span>Test Connection</span>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1" for="azampay_base_url">AzamPay Base URL</label>
                                    <input type="text" name="azampay_base_url" id="azampay_base_url" value="{{ $configs['azampay_base_url'] ?? '' }}" placeholder="https://checkout.azampay.co.tz" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1" for="azampay_auth_base_url">Auth Base URL</label>
                                    <input type="text" name="azampay_auth_base_url" id="azampay_auth_base_url" value="{{ $configs['azampay_auth_base_url'] ?? '' }}" placeholder="https://authenticator.azampay.co.tz" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1" for="azampay_client_id">Client ID</label>
                                    <input type="text" name="azampay_client_id" id="azampay_client_id" value="{{ $configs['azampay_client_id'] ?? '' }}" placeholder="Client-UUID" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1" for="azampay_app_name">App Name</label>
                                    <input type="text" name="azampay_app_name" id="azampay_app_name" value="{{ $configs['azampay_app_name'] ?? '' }}" placeholder="MyCompanyApp" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1" for="azampay_client_secret">Client Secret</label>
                                <input type="password" name="azampay_client_secret" id="azampay_client_secret" value="{{ $configs['azampay_client_secret'] ?? '' }}" placeholder="••••••••••••••••" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1" for="azampay_api_key">API Key (optional)</label>
                                <input type="text" name="azampay_api_key" id="azampay_api_key" value="{{ $configs['azampay_api_key'] ?? '' }}" placeholder="Optional key" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900">
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Floating Save Bar -->
                <div class="mt-8 flex justify-end">
                    <button type="submit" class="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md flex items-center space-x-2">
                        <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>Save Configuration Settings</span>
                    </button>
                </div>
            </form>
        </div>


        <!-- ==================== TAB 2: TRANSACTION AUDIT LOGS ==================== -->
        <div id="logs-tab" class="tab-panel hidden space-y-6">
            
            <!-- Filter & Action Toolbar -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <form action="{{ route('logs.index') }}" method="GET" id="logsFilterForm" class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <input type="hidden" name="tab" value="logs-tab">

                    <!-- Search & Filter Controls -->
                    <div class="flex flex-wrap items-center gap-3 flex-1">
                        <!-- Search Bar -->
                        <div class="relative min-w-[240px] flex-1">
                            <input type="text" 
                                   name="search" 
                                   value="{{ request('search') }}" 
                                   placeholder="Search ref ID, phone, gateway ref..."
                                   class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900">
                            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>

                        <!-- Gateway Filter -->
                        <select name="gateway" onchange="this.form.submit()" class="py-2 px-3 border border-slate-300 rounded-xl text-sm font-semibold bg-white text-slate-700">
                            <option value="all" {{ request('gateway') === 'all' || !request('gateway') ? 'selected' : '' }}>All Gateways</option>
                            <option value="selcom" {{ request('gateway') === 'selcom' ? 'selected' : '' }}>Selcom</option>
                            <option value="azampay" {{ request('gateway') === 'azampay' ? 'selected' : '' }}>AzamPay</option>
                        </select>

                        <!-- Status Filter -->
                        <select name="status" onchange="this.form.submit()" class="py-2 px-3 border border-slate-300 rounded-xl text-sm font-semibold bg-white text-slate-700">
                            <option value="all" {{ request('status') === 'all' || !request('status') ? 'selected' : '' }}>All Statuses</option>
                            <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                            <option value="approved" {{ request('status') === 'approved' ? 'selected' : '' }}>Approved</option>
                            <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Rejected</option>
                            <option value="failed" {{ request('status') === 'failed' ? 'selected' : '' }}>Failed</option>
                        </select>
                    </div>

                    <!-- Export & Bulk Actions -->
                    <div class="flex items-center space-x-2 shrink-0">
                        <button type="button" 
                                onclick="bulkRetrySelected()" 
                                class="px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-colors flex items-center space-x-1.5">
                            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            <span>Retry Failed</span>
                        </button>

                        <button type="button" 
                                onclick="bulkDeleteSelected()" 
                                class="px-3 py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center space-x-1.5">
                            <svg class="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            <span>Delete</span>
                        </button>

                        <a href="{{ route('logs.export', array_merge(request()->all(), ['format' => 'csv'])) }}" 
                           class="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center space-x-1.5">
                            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            <span>CSV</span>
                        </a>

                        <a href="{{ route('logs.export', array_merge(request()->all(), ['format' => 'json'])) }}" 
                           class="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center space-x-1.5">
                            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                            <span>JSON</span>
                        </a>
                    </div>
                </form>
            </div>

            <!-- Log Table -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr class="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <th class="p-4 w-10">
                                    <input type="checkbox" id="selectAllCheckboxes" onclick="toggleSelectAll(this)" class="rounded border-slate-300 text-slate-900 focus:ring-slate-900">
                                </th>
                                <th class="p-4">Timestamp</th>
                                <th class="p-4">External Reference</th>
                                <th class="p-4">Gateway Reference</th>
                                <th class="p-4">Gateway</th>
                                <th class="p-4">Phone</th>
                                <th class="p-4">Amount (TZS)</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse($logs as $log)
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="p-4">
                                        <input type="checkbox" value="{{ $log->id }}" class="log-checkbox rounded border-slate-300 text-slate-900 focus:ring-slate-900">
                                    </td>
                                    <td class="p-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                                        {{ $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : '—' }}
                                    </td>
                                    <td class="p-4 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                                        {{ $log->external_reference }}
                                    </td>
                                    <td class="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                                        {{ $log->gateway_reference ?? '—' }}
                                    </td>
                                    <td class="p-4 whitespace-nowrap">
                                        @if(strtolower($log->gateway) === 'selcom')
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                SELCOM
                                            </span>
                                        @else
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                AZAMPAY
                                            </span>
                                        @endif
                                    </td>
                                    <td class="p-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                                        {{ $log->phone }}
                                    </td>
                                    <td class="p-4 font-mono text-sm font-bold text-slate-900 whitespace-nowrap">
                                        {{ number_format($log->amount, 0) }}
                                    </td>
                                    <td class="p-4 whitespace-nowrap">
                                        @php $st = strtolower($log->status); @endphp
                                        @if($st === 'approved' || $st === 'completed' || $st === 'success')
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Approved
                                            </span>
                                        @elseif($st === 'pending')
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                Pending
                                            </span>
                                        @elseif($st === 'rejected' || $st === 'failed')
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                {{ ucfirst($st) }}
                                            </span>
                                        @else
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                {{ ucfirst($st) }}
                                            </span>
                                        @endif
                                    </td>
                                    <td class="p-4 text-right whitespace-nowrap space-x-1">
                                        <!-- Details Drawer Trigger -->
                                        <button type="button" 
                                                onclick="viewLogDetails({{ $log->id }})"
                                                class="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                                                title="View Raw Telemetry">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>

                                        <!-- Retry Trigger -->
                                        <button type="button" 
                                                onclick="retryLog({{ $log->id }})"
                                                class="p-1.5 text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-50"
                                                title="Re-issue Payment Call">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                        </button>

                                        <!-- Delete Trigger -->
                                        <button type="button" 
                                                onclick="deleteLog({{ $log->id }})"
                                                class="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50"
                                                title="Delete Audit Entry">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="p-12 text-center text-slate-500">
                                        <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                        <div class="font-bold text-slate-800 text-base">No Transaction Logs Found</div>
                                        <div class="text-xs text-slate-500 mt-1">Initiate a payment call or adjust your search filters.</div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Footer -->
                @if($logs->hasPages())
                    <div class="p-4 border-t border-slate-200 bg-slate-50/50">
                        {{ $logs->links() }}
                    </div>
                @endif
            </div>

        </div>

    </div>
</div>

<!-- Raw Telemetry JSON Modal Drawer -->
<div id="logDetailsModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-900 text-base flex items-center space-x-2">
                <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                <span>Transaction Telemetry Details</span>
            </h3>
            <button type="button" onclick="closeLogDetailsModal()" class="text-slate-400 hover:text-slate-700">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div class="p-6 overflow-y-auto space-y-4 font-mono text-xs" id="modalLogContent">
            <div class="text-slate-500">Loading telemetry data...</div>
        </div>
        <div class="p-4 border-t border-slate-200 bg-slate-50 text-right">
            <button type="button" onclick="closeLogDetailsModal()" class="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800">
                Close Inspector
            </button>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    // Tab Switcher
    function switchTab(tabId) {
        document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.remove('active', 'border-slate-900', 'text-slate-900');
            el.classList.add('border-transparent', 'text-slate-500');
        });

        document.getElementById(tabId).classList.remove('hidden');
        const activeBtn = document.getElementById('tab-btn-' + tabId);
        if (activeBtn) {
            activeBtn.classList.add('active', 'border-slate-900', 'text-slate-900');
            activeBtn.classList.remove('border-transparent', 'text-slate-500');
        }
    }

    // Auto-select tab if present in query param
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab && document.getElementById(tab)) {
            switchTab(tab);
        }
    });

    // Copy to clipboard helper
    function copyToClipboard(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        navigator.clipboard.writeText(input.value).then(() => {
            alert('Copied to clipboard: ' + input.value);
        });
    }

    // Select All Checkboxes
    function toggleSelectAll(master) {
        document.querySelectorAll('.log-checkbox').forEach(cb => cb.checked = master.checked);
    }

    // View Log Details Modal
    async function viewLogDetails(id) {
        const modal = document.getElementById('logDetailsModal');
        const container = document.getElementById('modalLogContent');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        container.innerHTML = '<div class="text-slate-500 animate-pulse">Fetching transaction telemetry...</div>';

        try {
            const res = await fetch(`/logs/${id}`, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();

            container.innerHTML = `
                <div class="grid grid-cols-2 gap-4 text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div><strong>Log ID:</strong> #${data.id}</div>
                    <div><strong>Gateway:</strong> ${data.gateway?.toUpperCase()}</div>
                    <div><strong>Ext Reference:</strong> ${data.external_reference}</div>
                    <div><strong>Gw Reference:</strong> ${data.gateway_reference || 'N/A'}</div>
                    <div><strong>Amount:</strong> TZS ${Number(data.amount).toLocaleString()}</div>
                    <div><strong>Status:</strong> ${data.status}</div>
                </div>

                <div class="mt-4">
                    <strong class="block text-slate-700 mb-1">Raw Request Payload:</strong>
                    <pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">${JSON.stringify(data.raw_request, null, 2)}</pre>
                </div>

                <div class="mt-4">
                    <strong class="block text-slate-700 mb-1">Raw Response Payload:</strong>
                    <pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">${JSON.stringify(data.raw_response, null, 2)}</pre>
                </div>
            `;
        } catch (e) {
            container.innerHTML = `<div class="text-rose-600 font-bold">Failed to load telemetry data: ${e.message}</div>`;
        }
    }

    function closeLogDetailsModal() {
        const modal = document.getElementById('logDetailsModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // Retry Log
    async function retryLog(id) {
        if (!confirm('Re-issue payment call for transaction #' + id + '?')) return;
        try {
            const res = await fetch(`/logs/retry/${id}`, {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            const data = await res.json();
            alert(data.message || 'Retry executed successfully');
            window.location.reload();
        } catch (e) {
            alert('Error retrying transaction: ' + e.message);
        }
    }

    // Delete Log
    async function deleteLog(id) {
        if (!confirm('Permanently delete transaction log #' + id + '?')) return;
        try {
            const res = await fetch(`/logs/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            const data = await res.json();
            alert(data.message || 'Log deleted');
            window.location.reload();
        } catch (e) {
            alert('Error deleting transaction: ' + e.message);
        }
    }

    // Bulk Delete
    async function bulkDeleteSelected() {
        const checked = Array.from(document.querySelectorAll('.log-checkbox:checked')).map(c => c.value);
        if (checked.length === 0) {
            alert('Please select at least one transaction log.');
            return;
        }

        if (!confirm(`Delete ${checked.length} selected transaction log(s)?`)) return;

        try {
            const res = await fetch('/logs/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ ids: checked })
            });
            const data = await res.json();
            alert(data.message);
            window.location.reload();
        } catch (e) {
            alert('Bulk delete failed: ' + e.message);
        }
    }

    // Bulk Retry
    async function bulkRetrySelected() {
        const checked = Array.from(document.querySelectorAll('.log-checkbox:checked')).map(c => c.value);
        if (checked.length === 0) {
            alert('Please select at least one failed transaction log.');
            return;
        }

        if (!confirm(`Retry ${checked.length} selected transaction(s)?`)) return;

        try {
            const res = await fetch('/logs/bulk-retry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ ids: checked })
            });
            const data = await res.json();
            alert(data.message);
            window.location.reload();
        } catch (e) {
            alert('Bulk retry failed: ' + e.message);
        }
    }
</script>
@endpush

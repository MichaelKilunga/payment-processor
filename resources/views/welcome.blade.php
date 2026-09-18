@extends('layouts.app')

@section('title', 'Payment Processor Platform — Portal')

@section('content')
<div class="py-12 bg-slate-50 min-h-[calc(100vh-4rem)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Hero Banner -->
        <div class="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden mb-10">
            <div class="relative z-10 max-w-3xl">
                <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Enterprise Mobile Money Integration Core</span>
                </div>
                
                <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
                    Unified Payment Gateway & Operations Hub
                </h1>
                
                <p class="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                    Seamlessly orchestrate Selcom Checkout URLs and AzamPay USSD Push integrations with automated failover, raw telemetry logging, and sandbox testing.
                </p>

                <div class="flex flex-wrap items-center gap-4">
                    <a href="{{ route('config.index') }}" class="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75" />
                        </svg>
                        <span>Configure Gateway Credentials</span>
                    </a>

                    <a href="{{ route('emulator.index') }}" class="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700 flex items-center space-x-2">
                        <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                        <span>Launch Developer Sandbox</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- 3 Quick Access Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            <!-- Card 1: Selcom Integration -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm mb-4">
                    SEL
                </div>
                <h3 class="font-bold text-slate-900 text-lg mb-2">Selcom Pay Driver</h3>
                <p class="text-xs text-slate-600 mb-4 leading-relaxed">
                    Generate HMAC-SHA256 signed minimal checkout order URLs for card and mobile wallet payments across Tanzania.
                </p>
                <a href="{{ route('config.index') }}" class="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1">
                    <span>Manage Selcom Keys</span>
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>

            <!-- Card 2: AzamPay Integration -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-800 font-bold text-sm mb-4">
                    AZM
                </div>
                <h3 class="font-bold text-slate-900 text-lg mb-2">AzamPay USSD Driver</h3>
                <p class="text-xs text-slate-600 mb-4 leading-relaxed">
                    Direct MNO checkout USSD push integration supporting Tigo, Airtel, Vodacom (M-Pesa), and Halotel.
                </p>
                <a href="{{ route('config.index') }}" class="text-xs font-bold text-indigo-700 hover:underline flex items-center space-x-1">
                    <span>Manage AzamPay OAuth</span>
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>

            <!-- Card 3: Audit & Telemetry -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-sm mb-4">
                    LOG
                </div>
                <h3 class="font-bold text-slate-900 text-lg mb-2">Audit Telemetry Hub</h3>
                <p class="text-xs text-slate-600 mb-4 leading-relaxed">
                    Inspect raw HTTP requests, retry failed transactions, and export CSV/JSON logs for accounting reconciliation.
                </p>
                <a href="{{ route('config.index', ['tab' => 'logs-tab']) }}" class="text-xs font-bold text-slate-800 hover:underline flex items-center space-x-1">
                    <span>View Audit Logs</span>
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>

        </div>

    </div>
</div>
@endsection

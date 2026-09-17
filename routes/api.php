<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentProcessorController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\EmulatorController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Payment Initiation
    Route::post('/payments/initiate', [PaymentProcessorController::class, 'initiate']);
    Route::get('/payments/status/{external_reference}', [PaymentProcessorController::class, 'status']);
    
    // Callback webhook endpoints for gateways
    Route::post('/callbacks/{gateway}', [PaymentProcessorController::class, 'callback']);

    // Config APIs for external querying/setting
    Route::get('/config', [ConfigController::class, 'getApiConfig']);
    Route::post('/config', [ConfigController::class, 'updateApiConfig']);

    // Logs API
    Route::get('/logs', [App\Http\Controllers\PaymentLogController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Emulator Fake Gateway API Routes
|--------------------------------------------------------------------------
| These endpoints mimic real gateway APIs so you can point the processor
| at them for local/sandbox testing without real credentials.
|
| To use, set in Config UI:
|   AzamPay Base URL      → {APP_URL}/api/emulator/azampay
|   AzamPay Auth Base URL → {APP_URL}/api/emulator/azampay
|   Selcom Base URL       → {APP_URL}/api/emulator/selcom
*/
Route::prefix('emulator')->group(function () {
    // Fake AzamPay auth token endpoint
    Route::post('/azampay/AppRegistration/GenerateToken', [EmulatorController::class, 'azampayToken']);

    // Fake AzamPay MNO checkout
    Route::post('/azampay/azampay/mno/checkout', [EmulatorController::class, 'azampayCheckout']);

    // Fake Selcom minimal checkout
    Route::post('/selcom/checkout/create-order-minimal', [EmulatorController::class, 'selcomCheckout']);

    // AJAX: get all transactions (for UI polling)
    Route::get('/transactions', [EmulatorController::class, 'pendingTransactions']);

    // AJAX: resolve a transaction (approve / reject / timeout)
    Route::post('/resolve/{id}', [EmulatorController::class, 'resolve']);
});


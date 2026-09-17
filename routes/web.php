<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\EmulatorController;
use App\Http\Controllers\PaymentLogController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [ConfigController::class, 'index'])->name('config.index');
Route::post('/config/save', [ConfigController::class, 'save'])->name('config.save');

/*
|--------------------------------------------------------------------------
| Log Management Routes
|--------------------------------------------------------------------------
*/
Route::prefix('logs')->name('logs.')->group(function () {
    Route::get('/', [PaymentLogController::class, 'index'])->name('index');
    Route::get('/export', [PaymentLogController::class, 'export'])->name('export');
    Route::get('/{id}', [PaymentLogController::class, 'show'])->name('show');
    Route::delete('/{id}', [PaymentLogController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-delete', [PaymentLogController::class, 'bulkDelete'])->name('bulk-delete');
    Route::post('/retry/{id}', [PaymentLogController::class, 'retry'])->name('retry');
    Route::post('/bulk-retry', [PaymentLogController::class, 'bulkRetry'])->name('bulk-retry');
});

/*
|--------------------------------------------------------------------------
| Emulator Routes
|--------------------------------------------------------------------------
| These routes serve the emulator UI and the Selcom fake checkout page.
*/
Route::prefix('emulator')->name('emulator.')->group(function () {
    Route::get('/', [EmulatorController::class, 'index'])->name('index');
    Route::get('/selcom-pay/{orderId}', [EmulatorController::class, 'selcomPayPage'])->name('selcom_pay');
});

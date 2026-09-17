<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Config;
use App\Models\PaymentLog;
use App\Services\Gateways\PaymentProcessorManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentProcessorController extends Controller
{
    protected PaymentProcessorManager $manager;

    public function __construct(PaymentProcessorManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * Initiate payment from the web app.
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'phone' => 'required|string',
            'external_reference' => 'required|string',
            'email' => 'nullable|email',
            'name' => 'nullable|string',
            'gateway' => 'nullable|string|in:selcom,azampay',
            'remarks' => 'nullable|string',
        ]);

        $gatewayName = $request->input('gateway') ?? Config::getValue('active_gateway', 'selcom');

        try {
            $gateway = $this->manager->getGateway($gatewayName);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }

        // Create log record
        $log = PaymentLog::create([
            'external_reference' => $request->input('external_reference'),
            'gateway' => $gateway->getName(),
            'amount' => $request->input('amount'),
            'phone' => $request->input('phone'),
            'status' => 'pending',
            'raw_request' => $request->all(),
        ]);

        // Call gateway
        $result = $gateway->initiatePayment([
            'amount' => $request->input('amount'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'name' => $request->input('name'),
            'external_reference' => $request->input('external_reference'),
            'remarks' => $request->input('remarks'),
        ]);

        // Update log
        $log->update([
            'gateway_reference' => $result['gateway_reference'] ?? null,
            'status' => $result['success'] ? 'pending' : 'failed',
            'raw_response' => $result['raw_response'] ?? null,
        ]);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'external_reference' => $request->input('external_reference'),
                'gateway_reference' => $result['gateway_reference'],
                'payment_url' => $result['payment_url'],
                'message' => 'Payment initiated successfully.'
            ]);
        }

        return response()->json([
            'success' => false,
            'external_reference' => $request->input('external_reference'),
            'message' => $result['error'] ?? 'Gateway initiation failed.'
        ], 502);
    }

    /**
     * Webhook/Callback handler for both Selcom and AzamPay.
     */
    public function callback(Request $request, string $gatewayName)
    {
        Log::info("Incoming callback from: {$gatewayName}", [
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        try {
            $gateway = $this->manager->getGateway($gatewayName);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        // Verify signature
        if (!$gateway->verifyWebhookSignature($request)) {
            Log::warning("Callback signature verification failed for gateway: {$gatewayName}");
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        // Parse callback
        $parsed = $gateway->parseCallback($request);

        // Find and update transaction log
        $log = PaymentLog::where('external_reference', $parsed['external_reference'])
            ->where('gateway', $gatewayName)
            ->first();

        if ($log) {
            $log->update([
                'gateway_reference' => $parsed['gateway_reference'] ?? $log->gateway_reference,
                'status' => $parsed['status'],
                'callback_payload' => $request->all(),
            ]);
        } else {
            Log::warning("Transaction log not found for reference: " . ($parsed['external_reference'] ?? 'n/a'));
        }

        // Forward callback to the Web Application (asynchronously/normally)
        $webappCallbackUrl = Config::getValue('webapp_callback_url');
        if (!empty($webappCallbackUrl)) {
            try {
                $response = Http::timeout(10)->post($webappCallbackUrl, $parsed);
                if (!$response->successful()) {
                    Log::error("Failed to forward callback to WebApp. Status: {$response->status()}, Response: {$response->body()}");
                } else {
                    Log::info("Successfully forwarded callback to WebApp.", ['ref' => $parsed['external_reference']]);
                }
            } catch (\Throwable $e) {
                Log::error("Exception occurred while forwarding callback to WebApp: " . $e->getMessage());
            }
        } else {
            Log::warning("WebApp callback URL is not configured. Skipped forwarding.");
        }

        // Acknowledge gateway provider
        return response()->json([
            'success' => true,
            'status' => 'acknowledged'
        ]);
    }

    /**
     * Retrieve status of a payment by external reference.
     */
    public function status(string $external_reference)
    {
        $log = PaymentLog::where('external_reference', $external_reference)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Payment log not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'external_reference' => $log->external_reference,
            'status' => $log->status, // pending, success, failed
            'amount' => $log->amount,
            'gateway' => $log->gateway,
            'gateway_reference' => $log->gateway_reference,
            'message' => $log->status === 'success' ? 'Payment completed successfully' : ($log->status === 'failed' ? 'Payment failed' : 'Payment is pending'),
            'created_at' => $log->created_at->toIso8601String(),
            'updated_at' => $log->updated_at->toIso8601String(),
        ]);
    }
}

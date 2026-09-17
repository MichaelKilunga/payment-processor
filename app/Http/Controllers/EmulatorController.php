<?php

namespace App\Http\Controllers;

use App\Models\Config;
use App\Models\EmulatorTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmulatorController extends Controller
{
    // ─────────────────────────────────────────────
    // UI Entry Point
    // ─────────────────────────────────────────────

    /**
     * Show the emulator dashboard.
     */
    public function index()
    {
        return view('emulator.index');
    }

    // ─────────────────────────────────────────────
    // Fake AzamPay Endpoints
    // ─────────────────────────────────────────────

    /**
     * Fake: AzamPay GenerateToken
     * Mimics: POST /AppRegistration/GenerateToken
     */
    public function azampayToken(Request $request)
    {
        // Return a convincing fake token
        $token = 'emulator_' . Str::random(48);

        return response()->json([
            'success'     => true,
            'statusCode'  => 200,
            'message'     => 'Token generated successfully.',
            'data'        => [
                'accessToken' => $token,
                'expire'      => now()->addHour()->toIso8601String(),
            ],
            'token'       => $token,
        ]);
    }

    /**
     * Fake: AzamPay MNO Checkout (USSD Push)
     * Mimics: POST /azampay/mno/checkout
     */
    public function azampayCheckout(Request $request)
    {
        $externalId = $request->input('externalId', 'AZAM-' . strtoupper(Str::random(8)));
        $amount     = $request->input('amount', 0);
        $phone      = $request->input('accountNumber', '');
        $provider   = $request->input('provider', 'Unknown');

        // Persist as pending emulator transaction
        EmulatorTransaction::create([
            'gateway'      => 'azampay',
            'external_id'  => $externalId,
            'amount'       => (float) $amount,
            'phone'        => $phone,
            'buyer_name'   => "Provider: {$provider}",
            'status'       => 'pending',
            'raw_payload'  => $request->all(),
        ]);

        Log::info("[EMULATOR] AzamPay checkout created. Ref: {$externalId}");

        return response()->json([
            'success'         => true,
            'transactionId'   => 'EMTXN-' . strtoupper(Str::random(12)),
            'message'         => 'Payment request received. Awaiting customer action.',
        ]);
    }

    // ─────────────────────────────────────────────
    // Fake Selcom Endpoints
    // ─────────────────────────────────────────────

    /**
     * Fake: Selcom Create Order Minimal
     * Mimics: POST /checkout/create-order-minimal
     */
    public function selcomCheckout(Request $request)
    {
        $orderId    = $request->input('order_id', 'SEL-' . strtoupper(Str::random(8)));
        $amount     = $request->input('amount', 0);
        $phone      = $request->input('buyer_phone', '');
        $buyerName  = $request->input('buyer_name', 'Customer');
        $buyerEmail = $request->input('buyer_email', '');

        // Build a fake Selcom payment URL pointing to our own emulator
        $paymentUrl = url("/emulator/selcom-pay/{$orderId}");
        $encodedUrl = base64_encode($paymentUrl);

        // Store transaction
        EmulatorTransaction::create([
            'gateway'      => 'selcom',
            'external_id'  => $orderId,
            'amount'       => (float) $amount,
            'phone'        => $phone,
            'buyer_name'   => $buyerName,
            'buyer_email'  => $buyerEmail,
            'status'       => 'pending',
            'raw_payload'  => $request->all(),
        ]);

        Log::info("[EMULATOR] Selcom order created. Ref: {$orderId}");

        return response()->json([
            'result'  => 'SUCCESS',
            'message' => 'Order created successfully.',
            'data'    => [
                [
                    'reference'           => 'EMSEL-' . strtoupper(Str::random(10)),
                    'payment_gateway_url' => $encodedUrl,
                ]
            ],
        ]);
    }

    /**
     * Selcom fake payment page (customer-facing redirect URL).
     */
    public function selcomPayPage(Request $request, string $orderId)
    {
        $transaction = EmulatorTransaction::where('external_id', $orderId)
            ->where('gateway', 'selcom')
            ->first();

        return view('emulator.selcom_pay', compact('transaction', 'orderId'));
    }

    // ─────────────────────────────────────────────
    // AJAX Endpoints for the Emulator UI
    // ─────────────────────────────────────────────

    /**
     * Return pending emulator transactions (for polling).
     */
    public function pendingTransactions()
    {
        $transactions = EmulatorTransaction::orderByDesc('created_at')
            ->take(50)
            ->get();

        return response()->json($transactions);
    }

    /**
     * Resolve a transaction: approve or reject.
     * This fires the real webhook callback to the processor.
     */
    public function resolve(Request $request, int $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject,timeout',
        ]);

        $transaction = EmulatorTransaction::findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json(['error' => 'Transaction already resolved.'], 422);
        }

        $action = $request->input('action');
        $status = match ($action) {
            'approve' => 'approved',
            'reject'  => 'rejected',
            'timeout' => 'timeout',
            default   => 'rejected',
        };

        $transaction->update(['status' => $status]);

        // Build and fire the callback to the processor
        $this->fireCallback($transaction, $status);

        return response()->json([
            'success'     => true,
            'transaction' => $transaction->fresh(),
        ]);
    }

    // ─────────────────────────────────────────────
    // Internal Helpers
    // ─────────────────────────────────────────────

    /**
     * Fire a callback to the processor's /api/v1/callbacks/{gateway} endpoint.
     * The emulator signs it using the configured secret so signature verification passes.
     */
    protected function fireCallback(EmulatorTransaction $transaction, string $resolvedStatus): void
    {
        $gateway    = $transaction->gateway;
        $callbackUrl = url("/api/v1/callbacks/{$gateway}");

        $paymentStatus = ($resolvedStatus === 'approved') ? 'success' : 'failed';

        if ($gateway === 'azampay') {
            $payload = [
                'utilityref'    => $transaction->external_id,
                'externalId'    => $transaction->external_id,
                'transactionId' => 'EMTXN-' . strtoupper(Str::random(12)),
                'amount'        => (string) $transaction->amount,
                'msisdn'        => $transaction->phone,
                'status'        => $paymentStatus,
                'message'       => $resolvedStatus === 'approved' ? 'Payment completed successfully' : 'Payment was declined by customer',
            ];

            // Sign using AzamPay HMAC (the processor verifyWebhookSignature returns true when no header)
            $secret  = Config::getValue('azampay_client_secret', 'emulator_secret');
            $rawBody = json_encode($payload);
            $signature = hash_hmac('sha256', $rawBody, $secret);

            try {
                Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Signature'  => $signature,
                ])->timeout(10)->post($callbackUrl, $payload);

                Log::info("[EMULATOR] AzamPay callback fired.", ['ref' => $transaction->external_id, 'status' => $paymentStatus]);
            } catch (\Throwable $e) {
                Log::error("[EMULATOR] Failed to fire AzamPay callback: " . $e->getMessage());
            }
        }

        if ($gateway === 'selcom') {
            $timestamp   = now()->setTimezone('Africa/Dar_es_Salaam')->toIso8601String();
            $secret      = Config::getValue('selcom_secret_key', 'emulator_secret');
            $resultCode  = $resolvedStatus === 'approved' ? '000' : '999';
            $result      = $resolvedStatus === 'approved' ? 'success' : 'failure';
            $reference   = 'EMSEL-' . strtoupper(Str::random(10));

            $payload = [
                'order_id'   => $transaction->external_id,
                'reference'  => $reference,
                'amount'     => (string) $transaction->amount,
                'msisdn'     => $transaction->phone,
                'result'     => $result,
                'resultcode' => $resultCode,
                'message'    => $resolvedStatus === 'approved' ? 'Payment successful' : 'Payment declined',
            ];

            // Compute Selcom HMAC signature
            $signedFields = implode(',', array_keys($payload));
            $data = 'timestamp=' . $timestamp;
            foreach (array_keys($payload) as $key) {
                $data .= '&' . $key . '=' . strval($payload[$key]);
            }
            $digest = base64_encode(hash_hmac('sha256', $data, $secret, true));

            try {
                Http::withHeaders([
                    'Content-Type'  => 'application/json',
                    'Timestamp'     => $timestamp,
                    'Digest'        => $digest,
                    'Digest-Method' => 'HS256',
                    'Signed-Fields' => $signedFields,
                ])->timeout(10)->post($callbackUrl, $payload);

                Log::info("[EMULATOR] Selcom callback fired.", ['ref' => $transaction->external_id, 'status' => $result]);
            } catch (\Throwable $e) {
                Log::error("[EMULATOR] Failed to fire Selcom callback: " . $e->getMessage());
            }
        }
    }
}

<?php

namespace App\Services\Gateways;

use App\Models\Config;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AzamPayGateway implements PaymentGatewayInterface
{
    public function getName(): string
    {
        return 'azampay';
    }

    public function initiatePayment(array $params): array
    {
        $baseUrl = rtrim(Config::getValue('azampay_base_url'), '/');
        $authBaseUrl = rtrim(Config::getValue('azampay_auth_base_url'), '/');
        $clientId = Config::getValue('azampay_client_id');
        $clientSecret = Config::getValue('azampay_client_secret');
        $appName = Config::getValue('azampay_app_name');
        $apiKey = Config::getValue('azampay_api_key');

        $phone = $this->formatPhoneNumber($params['phone'] ?? '');
        $provider = $params['provider'] ?? $this->detectOperator($phone);

        if (!$provider) {
            return [
                'success' => false,
                'error' => 'Unable to detect mobile operator from phone number prefix',
                'raw_response' => ['phone' => $phone]
            ];
        }

        // 1. Generate token
        try {
            $tokenResponse = Http::withoutVerifying()->timeout(15)->post($authBaseUrl . '/AppRegistration/GenerateToken', [
                'appName' => $appName,
                'clientId' => $clientId,
                'clientSecret' => $clientSecret
            ]);

            $tokenData = $tokenResponse->json();
            $token = data_get($tokenData, 'token') ?? data_get($tokenData, 'data.accessToken') ?? data_get($tokenData, 'data.token') ?? data_get($tokenData, 'accessToken');
          
            // if the token is not generated
            if (!$tokenResponse->successful() || !$token) {
                return [
                    'success' => false,
                    'error' => 'Failed to generate AzamPay token: ' . ($tokenData['message'] ?? 'Unknown error'),
                    'raw_response' => $tokenData
                ];
            }
        } catch (\Throwable $e) {
            Log::error('AzamPay token generation error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'AzamPay token generation failed: ' . $e->getMessage(),
                'raw_response' => ['exception' => $e->getMessage()]
            ];
        }

        // 2. Perform checkout
        $externalId = $params['external_reference'] ?? ('GTY-1-' . strtoupper(uniqid()));
        
        $payload = [
            'amount' => strval($params['amount']),
            'currency' => 'TZS',
            'accountNumber' => $phone,
            'externalId' => $externalId,
            'provider' => $provider
        ];

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'X-API-KEY' => $apiKey,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ])
            ->timeout(20)
            ->post($baseUrl . '/azampay/mno/checkout', $payload);

            $responseBody = $response->json();

            if ($response->successful() && isset($responseBody['success']) && ($responseBody['success'] === true || $responseBody['success'] === 'true')) {
                return [
                    'success' => true,
                    'gateway_reference' => $responseBody['transactionId'] ?? null,
                    'payment_url' => null, // AzamPay USSD push has no URL
                    'raw_response' => $responseBody
                ];
            }

            return [
                'success' => false,
                'error' => $responseBody['message'] ?? 'Gateway failed to initiate payment',
                'raw_response' => $responseBody ?? $response->body()
            ];
        } catch (\Throwable $e) {
            Log::error('AzamPay initiatePayment error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Connection to AzamPay failed: ' . $e->getMessage(),
                'raw_response' => ['exception' => $e->getMessage()]
            ];
        }
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Signature') ?? $request->header('Signature');
        if (!$signature) {
            return true;
        }

        $secret = Config::getValue('azampay_client_secret');
        $rawBody = $request->getContent();
        
        $computed = hash_hmac('sha256', $rawBody, $secret);
        
        return hash_equals($signature, $computed);
    }

    public function parseCallback(Request $request): array
    {
        $data = $request->all();
        
        $orderId = $data['utilityref'] ?? $data['externalId'] ?? null;
        $reference = $data['transactionId'] ?? null;
        $amount = isset($data['amount']) ? (float) $data['amount'] : 0.0;
        
        $statusVal = strtolower($data['status'] ?? '');
        $status = 'failed';
        if ($statusVal === 'success' || $statusVal === 'completed' || $statusVal === 'paid') {
            $status = 'success';
        }

        return [
            'external_reference' => $orderId,
            'gateway' => 'azampay',
            'gateway_reference' => $reference,
            'amount' => $amount,
            'status' => $status,
            'phone' => $data['msisdn'] ?? '',
            'message' => $data['message'] ?? ($status === 'success' ? 'Payment succeeded' : 'Payment failed'),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function detectOperator(string $phone): ?string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        if (substr($phone, 0, 1) === '0') {
            $phone = '255' . substr($phone, 1);
        }
        if (substr($phone, 0, 4) === '2550') {
            $phone = '255' . substr($phone, 4);
        }
        if (strlen($phone) === 9) {
            $phone = '255' . $phone;
        }
        
        // MNO prefix rules for Tanzania
        if (preg_match('/^255(75|76|74|61|79)/', $phone)) {
            return 'Mpesa';
        }
        if (preg_match('/^255(65|67|71)/', $phone)) {
            return 'Tigo';
        }
        if (preg_match('/^255(68|69|78)/', $phone)) {
            return 'Airtel';
        }
        if (preg_match('/^255(62)/', $phone)) {
            return 'Halopesa';
        }
        if (preg_match('/^255(73)/', $phone)) {
            return 'Azampesa';
        }
        
        return null;
    }

    private function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', trim($phone));

        if (substr($phone, 0, 1) === '0') {
            $phone = '255' . substr($phone, 1);
        }

        if (substr($phone, 0, 4) === '2550') {
            $phone = '255' . substr($phone, 4);
        }

        if (strlen($phone) === 9) {
            $phone = '255' . $phone;
        }

        return $phone;
    }
}

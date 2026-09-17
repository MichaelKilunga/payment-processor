<?php

namespace App\Services\Gateways;

use App\Models\Config;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SelcomGateway implements PaymentGatewayInterface
{
    public function getName(): string
    {
        return 'selcom';
    }

    public function initiatePayment(array $params): array
    {
        $baseUrl = rtrim(Config::getValue('selcom_base_url'), '/');
        $apiKey = Config::getValue('selcom_api_key');
        $apiSecret = Config::getValue('selcom_secret_key');
        $vendor = Config::getValue('selcom_vendor');

        $orderId = $params['external_reference'] ?? (Carbon::now()->format('YmdHis') . round(microtime(true) * 1000));
        
        $phone = $this->formatPhoneNumber($params['phone'] ?? '');

        // Redirect & cancel URLs on the web app (placeholders)
        $redirect = base64_encode(Config::getValue('webapp_callback_url') . "?status=success&ref=" . $orderId);
        $cancel = base64_encode(Config::getValue('webapp_callback_url') . "?status=cancelled&ref=" . $orderId);

        $orderMinArray = [
            'vendor' => $vendor,
            'order_id' => $orderId,
            'buyer_email' => $params['email'] ?? 'customer@example.com',
            'buyer_name' => $params['name'] ?? 'Guest Customer',
            'buyer_phone' => $phone,
            'amount' => (int) ($params['amount']),
            'currency' => 'TZS',
            'redirect_url' => $redirect,
            'cancel_url' => $cancel,
            'webhook' => url('/api/v1/callbacks/selcom'),
            'buyer_remarks' => $params['remarks'] ?? 'Payment',
            'merchant_remarks' => 'Order ' . $orderId,
            'no_of_items' => 1
        ];

        $headers = $this->computeHeaders($orderMinArray, $apiKey, $apiSecret);

        try {
            $response = Http::withHeaders($headers)
                ->timeout(15)
                ->post($baseUrl . '/checkout/create-order-minimal', $orderMinArray);

            $responseBody = $response->json();
            
            if ($response->successful() && isset($responseBody['result']) && strtolower($responseBody['result']) === 'success') {
                $data = $responseBody['data'][0] ?? [];
                return [
                    'success' => true,
                    'gateway_reference' => $data['reference'] ?? null,
                    'payment_url' => isset($data['payment_gateway_url']) ? base64_decode($data['payment_gateway_url']) : null,
                    'raw_response' => $responseBody
                ];
            }

            return [
                'success' => false,
                'error' => $responseBody['message'] ?? 'Gateway failed to initiate payment',
                'raw_response' => $responseBody ?? $response->body()
            ];
        } catch (\Throwable $e) {
            Log::error('Selcom initiatePayment error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return [
                'success' => false,
                'error' => 'Connection to Selcom failed: ' . $e->getMessage(),
                'raw_response' => ['exception' => $e->getMessage()]
            ];
        }
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $digestHeader = $request->header('Digest');
        $timestamp = $request->header('Timestamp');
        $signedFields = $request->header('Signed-Fields');

        if (!$digestHeader || !$timestamp || !$signedFields) {
            return false;
        }

        $apiSecret = Config::getValue('selcom_secret_key');
        $fields = explode(',', $signedFields);
        
        $data = 'timestamp=' . $timestamp;
        $requestData = $request->all();

        foreach ($fields as $field) {
            if (!isset($requestData[$field])) {
                return false;
            }
            $data .= '&' . $field . '=' . strval($requestData[$field]);
        }

        $computed = base64_encode(hash_hmac('sha256', $data, $apiSecret, true));
        return hash_equals($digestHeader, $computed);
    }

    public function parseCallback(Request $request): array
    {
        $data = $request->all();
        
        $orderId = $data['order_id'] ?? $data['utilityref'] ?? null;
        $reference = $data['reference'] ?? $data['transid'] ?? null;
        $amount = isset($data['amount']) ? (float) $data['amount'] : 0.0;
        
        $result = strtolower($data['result'] ?? '');
        $resultCode = $data['resultcode'] ?? '';
        
        $status = 'failed';
        if ($result === 'success' || $resultCode === '000') {
            $status = 'success';
        }

        return [
            'external_reference' => $orderId,
            'gateway' => 'selcom',
            'gateway_reference' => $reference,
            'amount' => $amount,
            'status' => $status,
            'phone' => $data['msisdn'] ?? '',
            'message' => $data['message'] ?? ($status === 'success' ? 'Payment succeeded' : 'Payment failed'),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    private function computeHeaders(array $arrayData, string $apiKey, string $apiSecret): array
    {
        $authToken = 'SELCOM ' . base64_encode($apiKey);
        $signedFields = implode(',', array_keys($arrayData));
        $fieldOrder = explode(',', $signedFields);
        
        $timestamp = now()->setTimezone('Africa/Dar_es_Salaam')->toIso8601String();
        
        $data = 'timestamp=' . $timestamp;
        foreach ($fieldOrder as $key) {
            $data .= '&' . $key . '=' . strval($arrayData[$key]);
        }

        $digest = base64_encode(hash_hmac('sha256', $data, $apiSecret, true));

        return [
            'Authorization' => $authToken,
            'Digest-Method' => 'HS256',
            'Timestamp' => $timestamp,
            'Digest' => $digest,
            'Signed-Fields' => $signedFields,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json'
        ];
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

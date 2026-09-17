<?php

namespace App\Http\Controllers;

use App\Models\Config;
use App\Models\PaymentLog;
use App\Services\Gateways\PaymentProcessorManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ConfigController extends Controller
{
    protected PaymentProcessorManager $manager;

    public function __construct(PaymentProcessorManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * Display the settings GUI panel.
     */
    public function index()
    {
        // Fetch all config keys
        $keys = [
            'active_gateway', 'webapp_callback_url',
            'selcom_base_url', 'selcom_api_key', 'selcom_secret_key', 'selcom_vendor',
            'azampay_base_url', 'azampay_auth_base_url', 'azampay_client_id', 'azampay_client_secret', 'azampay_app_name', 'azampay_api_key'
        ];

        $configs = [];
        foreach ($keys as $key) {
            $configs[$key] = Config::getValue($key);
        }

        // Fetch paginated payment logs
        $logs = PaymentLog::orderBy('created_at', 'desc')->paginate(10);

        return view('config.index', compact('configs', 'logs'));
    }

    /**
     * Save the config parameters from GUI form.
     */
    public function save(Request $request)
    {
        $keys = [
            'active_gateway', 'webapp_callback_url',
            'selcom_base_url', 'selcom_api_key', 'selcom_secret_key', 'selcom_vendor',
            'azampay_base_url', 'azampay_auth_base_url', 'azampay_client_id', 'azampay_client_secret', 'azampay_app_name', 'azampay_api_key'
        ];

        // If the user clicked "Test" instead of "Save"
        if ($request->has('test_gateway')) {
            $gatewayToTest = $request->input('test_gateway');
            return $this->testConnection($gatewayToTest, $request->all());
        }

        foreach ($keys as $key) {
            if ($request->has($key)) {
                Config::updateOrCreate(
                    ['key' => $key],
                    ['value' => $request->input($key)]
                );
            }
        }

        return redirect()->route('config.index')->with('success', 'Configurations saved successfully!');
    }

    /**
     * Test the connection to gateway providers.
     */
    protected function testConnection(string $gateway, array $formData)
    {
        if ($gateway === 'selcom') {
            $baseUrl = rtrim($formData['selcom_base_url'] ?? '', '/');
            $apiKey = $formData['selcom_api_key'] ?? '';
            $secretKey = $formData['selcom_secret_key'] ?? '';

            if (empty($baseUrl) || empty($apiKey) || empty($secretKey)) {
                return redirect()->route('config.index')->with('error', 'Selcom Base URL, API Key, and Secret Key are required to run the test.');
            }

            // Perform lightweight test call to Selcom Minimal Checkout (with empty body to check signature validation / network)
            try {
                // Generate a temporary mock signature to verify if the client computes it properly
                $timestamp = now()->setTimezone('Africa/Dar_es_Salaam')->toIso8601String();
                $authToken = 'SELCOM ' . base64_encode($apiKey);
                $signedFields = 'vendor,order_id';
                $testData = [
                    'vendor' => $formData['selcom_vendor'] ?? 'TILL123',
                    'order_id' => 'TEST-' . time()
                ];
                
                $data = 'timestamp=' . $timestamp . '&vendor=' . $testData['vendor'] . '&order_id=' . $testData['order_id'];
                $digest = base64_encode(hash_hmac('sha256', $data, $secretKey, true));

                $response = Http::withHeaders([
                    'Authorization' => $authToken,
                    'Digest-Method' => 'HS256',
                    'Timestamp' => $timestamp,
                    'Digest' => $digest,
                    'Signed-Fields' => $signedFields
                ])->timeout(8)->post($baseUrl . '/checkout/create-order-minimal', $testData);

                // Any HTTP response (even 400/401/404) means network connection is active!
                if ($response->status() === 401 || $response->status() === 403) {
                    return redirect()->route('config.index')->with('error', "Connection successful, but credentials were rejected by Selcom (HTTP {$response->status()}).");
                }
                
                $responseBody = $response->json();
                $message = $responseBody['message'] ?? 'Status Code ' . $response->status();
                
                return redirect()->route('config.index')->with('success', "Selcom API contacted successfully! Gateway responded: {$message}");
            } catch (\Throwable $e) {
                return redirect()->route('config.index')->with('error', "Network connection to Selcom failed: " . $e->getMessage());
            }
        }

        if ($gateway === 'azampay') {
            $authBaseUrl = rtrim($formData['azampay_auth_base_url'] ?? '', '/');
            $clientId = $formData['azampay_client_id'] ?? '';
            $clientSecret = $formData['azampay_client_secret'] ?? '';
            $appName = $formData['azampay_app_name'] ?? '';

            if (empty($authBaseUrl) || empty($clientId) || empty($clientSecret)) {
                return redirect()->route('config.index')->with('error', 'AzamPay Auth URL, Client ID, and Client Secret are required to run the test.');
            }

            try {
                $response = Http::timeout(8)->post($authBaseUrl . '/AppRegistration/GenerateToken', [
                    'appName' => $appName,
                    'clientId' => $clientId,
                    'clientSecret' => $clientSecret
                ]);

                $json = $response->json();
                $token = data_get($json, 'token') ?? data_get($json, 'data.accessToken') ?? data_get($json, 'data.token') ?? data_get($json, 'accessToken');

                if ($response->successful() && ($token || data_get($json, 'success') === true)) {
                    return redirect()->route('config.index')->with('success', 'AzamPay connection test successful! Access token generated successfully.');
                }

                $err = $response->json()['message'] ?? 'Authentication failed (HTTP ' . $response->status() . ')';
                return redirect()->route('config.index')->with('error', "AzamPay authentication endpoint reached, but token generation failed: {$err}");
            } catch (\Throwable $e) {
                return redirect()->route('config.index')->with('error', "Network connection to AzamPay failed: " . $e->getMessage());
            }
        }

        return redirect()->route('config.index')->with('error', 'Unsupported gateway test requested.');
    }

    /**
     * API endpoint to retrieve current configuration values.
     */
    public function getApiConfig()
    {
        return response()->json([
            'active_gateway' => Config::getValue('active_gateway', 'selcom'),
            'webapp_callback_url' => Config::getValue('webapp_callback_url'),
            'available_gateways' => $this->manager->getAvailableDrivers()
        ]);
    }

    /**
     * API endpoint to update active configurations.
     */
    public function updateApiConfig(Request $request)
    {
        $request->validate([
            'active_gateway' => 'nullable|string|in:selcom,azampay',
            'webapp_callback_url' => 'nullable|url',
        ]);

        if ($request->has('active_gateway')) {
            Config::updateOrCreate(
                ['key' => 'active_gateway'],
                ['value' => $request->input('active_gateway')]
            );
        }

        if ($request->has('webapp_callback_url')) {
            Config::updateOrCreate(
                ['key' => 'webapp_callback_url'],
                ['value' => $request->input('webapp_callback_url')]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Configuration updated successfully.',
            'active_gateway' => Config::getValue('active_gateway', 'selcom'),
            'webapp_callback_url' => Config::getValue('webapp_callback_url')
        ]);
    }
}

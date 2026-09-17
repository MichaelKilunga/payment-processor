<?php

namespace Tests\Feature;

use App\Models\Config;
use App\Models\PaymentLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentProcessorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed default config settings
        Config::create(['key' => 'active_gateway', 'value' => 'selcom']);
        Config::create(['key' => 'webapp_callback_url', 'value' => 'http://mywebapp.com/api/v1/callback']);
        
        Config::create(['key' => 'selcom_base_url', 'value' => 'https://sandbox.selcom.net/v1']);
        Config::create(['key' => 'selcom_api_key', 'value' => 'api_key_123']);
        Config::create(['key' => 'selcom_secret_key', 'value' => 'secret_456']);
        Config::create(['key' => 'selcom_vendor', 'value' => 'TILL_MOCK']);

        Config::create(['key' => 'azampay_base_url', 'value' => 'https://sandbox.azampay.co.tz']);
        Config::create(['key' => 'azampay_auth_base_url', 'value' => 'https://authenticator-sandbox.azampay.co.tz']);
        Config::create(['key' => 'azampay_client_id', 'value' => 'client_id_mock']);
        Config::create(['key' => 'azampay_client_secret', 'value' => 'secret_mock']);
        Config::create(['key' => 'azampay_app_name', 'value' => 'app_mock']);
        Config::create(['key' => 'azampay_api_key', 'value' => 'api_key_mock']);
    }

    public function test_it_initiates_selcom_payment_successfully()
    {
        Http::fake([
            'https://sandbox.selcom.net/v1/checkout/create-order-minimal' => Http::response([
                'result' => 'SUCCESS',
                'message' => 'Order created',
                'data' => [
                    [
                        'reference' => 'SELCOM-MOCK-REF-1',
                        'payment_gateway_url' => base64_encode('https://checkout.selcom.net/pay/123')
                    ]
                ]
            ], 200)
        ]);

        $response = $this->postJson('/api/v1/payments/initiate', [
            'amount' => 15000,
            'phone' => '0712345678',
            'external_reference' => 'APP-REF-1',
            'email' => 'buyer@gmail.com',
            'name' => 'John Doe'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'external_reference' => 'APP-REF-1',
                'gateway_reference' => 'SELCOM-MOCK-REF-1',
                'payment_url' => 'https://checkout.selcom.net/pay/123'
            ]);

        $this->assertDatabaseHas('payment_logs', [
            'external_reference' => 'APP-REF-1',
            'gateway' => 'selcom',
            'amount' => 15000,
            'status' => 'pending'
        ]);
    }

    public function test_it_initiates_azampay_payment_successfully()
    {
        Config::updateOrCreate(['key' => 'active_gateway'], ['value' => 'azampay']);

        Http::fake([
            'https://authenticator-sandbox.azampay.co.tz/AppRegistration/GenerateToken' => Http::response([
                'token' => 'jwt_mock_token_123',
                'success' => true
            ], 200),
            'https://sandbox.azampay.co.tz/azampay/mno/checkout' => Http::response([
                'success' => true,
                'transactionId' => 'AZAM-TX-9988',
                'message' => 'Processed successfully'
            ], 200)
        ]);

        $response = $this->postJson('/api/v1/payments/initiate', [
            'amount' => 5000,
            'phone' => '0754123456',
            'external_reference' => 'APP-REF-2',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'external_reference' => 'APP-REF-2',
                'gateway_reference' => 'AZAM-TX-9988',
                'payment_url' => null
            ]);

        $this->assertDatabaseHas('payment_logs', [
            'external_reference' => 'APP-REF-2',
            'gateway' => 'azampay',
            'amount' => 5000,
            'status' => 'pending'
        ]);
    }

    public function test_it_handles_selcom_callback_and_forwards_to_webapp()
    {
        Http::fake([
            'http://mywebapp.com/api/v1/callback' => Http::response(['status' => 'ok'], 200)
        ]);

        PaymentLog::create([
            'external_reference' => 'APP-REF-3',
            'gateway' => 'selcom',
            'amount' => 2000,
            'phone' => '255712345678',
            'status' => 'pending'
        ]);

        $timestamp = '2026-07-20T21:00:00+03:00';
        $signedFields = 'order_id,reference,amount,result,resultcode,msisdn,message';
        
        $testData = [
            'order_id' => 'APP-REF-3',
            'reference' => 'SELCOM-REF-99',
            'amount' => '2000',
            'result' => 'SUCCESS',
            'resultcode' => '000',
            'msisdn' => '255712345678',
            'message' => 'Succeeded'
        ];

        $data = 'timestamp=' . $timestamp;
        foreach ($testData as $key => $val) {
            $data .= '&' . $key . '=' . $val;
        }
        $digest = base64_encode(hash_hmac('sha256', $data, 'secret_456', true));

        $response = $this->withHeaders([
            'Digest' => $digest,
            'Timestamp' => $timestamp,
            'Signed-Fields' => $signedFields
        ])->postJson('/api/v1/callbacks/selcom', $testData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'status' => 'acknowledged'
            ]);

        $this->assertDatabaseHas('payment_logs', [
            'external_reference' => 'APP-REF-3',
            'gateway' => 'selcom',
            'gateway_reference' => 'SELCOM-REF-99',
            'status' => 'success'
        ]);
    }

    public function test_it_returns_pending_status_for_uninitiated_payment()
    {
        PaymentLog::create([
            'external_reference' => 'APP-REF-STATUS-1',
            'gateway' => 'azampay',
            'amount' => 7500,
            'phone' => '255754123456',
            'status' => 'pending'
        ]);

        $response = $this->getJson('/api/v1/payments/status/APP-REF-STATUS-1');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'external_reference' => 'APP-REF-STATUS-1',
                'status' => 'pending',
                'amount' => 7500,
                'gateway' => 'azampay',
            ]);
    }

    public function test_it_returns_success_status_after_payment_completes()
    {
        PaymentLog::create([
            'external_reference' => 'APP-REF-STATUS-2',
            'gateway' => 'azampay',
            'amount' => 3000,
            'phone' => '255712345678',
            'gateway_reference' => 'AZ-DONE-001',
            'status' => 'success'
        ]);

        $response = $this->getJson('/api/v1/payments/status/APP-REF-STATUS-2');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'status' => 'success',
                'gateway_reference' => 'AZ-DONE-001',
                'message' => 'Payment completed successfully',
            ]);
    }

    public function test_it_returns_404_for_unknown_reference()
    {
        $response = $this->getJson('/api/v1/payments/status/DOES-NOT-EXIST');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Payment log not found',
            ]);
    }
}

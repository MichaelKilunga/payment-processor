<?php

namespace Tests\Feature;

use App\Models\Config;
use App\Models\PaymentLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentLogControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Config::create(['key' => 'active_gateway', 'value' => 'selcom']);
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

    public function test_it_lists_paginated_and_filtered_logs()
    {
        PaymentLog::create([
            'external_reference' => 'REF-001',
            'gateway' => 'selcom',
            'amount' => 1000,
            'phone' => '0712000001',
            'status' => 'success',
        ]);

        PaymentLog::create([
            'external_reference' => 'REF-002',
            'gateway' => 'azampay',
            'amount' => 2000,
            'phone' => '0754000002',
            'status' => 'failed',
        ]);

        // Filter by gateway
        $response = $this->getJson('/logs?gateway=selcom');
        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
        $this->assertEquals('REF-001', $response->json('data.0.external_reference'));

        // Search reference
        $responseSearch = $this->getJson('/logs?search=REF-002');
        $responseSearch->assertStatus(200);
        $this->assertEquals(1, count($responseSearch->json('data')));
        $this->assertEquals('REF-002', $responseSearch->json('data.0.external_reference'));
    }

    public function test_it_deletes_a_single_log()
    {
        $log = PaymentLog::create([
            'external_reference' => 'DEL-REF-1',
            'gateway' => 'selcom',
            'amount' => 5000,
            'phone' => '0712345678',
            'status' => 'pending',
        ]);

        $response = $this->deleteJson("/logs/{$log->id}");
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('payment_logs', ['id' => $log->id]);
    }

    public function test_it_bulk_deletes_logs()
    {
        $log1 = PaymentLog::create(['external_reference' => 'BULK-1', 'gateway' => 'selcom', 'amount' => 1000, 'phone' => '0711', 'status' => 'success']);
        $log2 = PaymentLog::create(['external_reference' => 'BULK-2', 'gateway' => 'azampay', 'amount' => 2000, 'phone' => '0722', 'status' => 'failed']);
        $log3 = PaymentLog::create(['external_reference' => 'BULK-3', 'gateway' => 'selcom', 'amount' => 3000, 'phone' => '0733', 'status' => 'pending']);

        // Delete log1 and log2
        $response = $this->postJson('/logs/bulk-delete', [
            'ids' => [$log1->id, $log2->id]
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'count' => 2]);

        $this->assertDatabaseMissing('payment_logs', ['id' => $log1->id]);
        $this->assertDatabaseMissing('payment_logs', ['id' => $log2->id]);
        $this->assertDatabaseHas('payment_logs', ['id' => $log3->id]);
    }

    public function test_it_clears_all_logs()
    {
        PaymentLog::create(['external_reference' => 'CLR-1', 'gateway' => 'selcom', 'amount' => 1000, 'phone' => '0711', 'status' => 'success']);
        PaymentLog::create(['external_reference' => 'CLR-2', 'gateway' => 'azampay', 'amount' => 2000, 'phone' => '0722', 'status' => 'failed']);

        $response = $this->postJson('/logs/bulk-delete', ['type' => 'all']);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'count' => 2]);

        $this->assertEquals(0, PaymentLog::count());
    }

    public function test_it_retries_a_failed_transaction()
    {
        Http::fake([
            'https://sandbox.selcom.net/v1/checkout/create-order-minimal' => Http::response([
                'result' => 'SUCCESS',
                'message' => 'Order re-created',
                'data' => [
                    [
                        'reference' => 'SELCOM-RETRY-REF-100',
                        'payment_gateway_url' => base64_encode('https://checkout.selcom.net/pay/retry100')
                    ]
                ]
            ], 200)
        ]);

        $log = PaymentLog::create([
            'external_reference' => 'FAIL-REF-1',
            'gateway' => 'selcom',
            'amount' => 8000,
            'phone' => '0712999888',
            'status' => 'failed',
            'raw_request' => [
                'amount' => 8000,
                'phone' => '0712999888',
                'external_reference' => 'FAIL-REF-1',
                'email' => 'retry@test.com'
            ]
        ]);

        $response = $this->postJson("/logs/retry/{$log->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Transaction retried successfully! Gateway status set to pending.'
            ]);

        $this->assertDatabaseHas('payment_logs', [
            'id' => $log->id,
            'gateway_reference' => 'SELCOM-RETRY-REF-100',
            'status' => 'pending'
        ]);
    }

    public function test_it_exports_logs_to_csv()
    {
        PaymentLog::create(['external_reference' => 'EXP-1', 'gateway' => 'selcom', 'amount' => 5000, 'phone' => '0711111111', 'status' => 'success']);

        $response = $this->get('/logs/export?format=csv');
        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('EXP-1', $response->streamedContent());
    }
}

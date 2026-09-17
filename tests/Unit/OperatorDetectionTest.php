<?php

namespace Tests\Unit;

use App\Services\Gateways\AzamPayGateway;
use PHPUnit\Framework\TestCase;

class OperatorDetectionTest extends TestCase
{
    public function test_it_detects_tigo_operator()
    {
        $gateway = new AzamPayGateway();
        $this->assertEquals('Tigo', $gateway->detectOperator('0655123456'));
        $this->assertEquals('Tigo', $gateway->detectOperator('255713456789'));
        $this->assertEquals('Tigo', $gateway->detectOperator('+255-678-456789'));
    }

    public function test_it_detects_mpesa_operator()
    {
        $gateway = new AzamPayGateway();
        $this->assertEquals('Mpesa', $gateway->detectOperator('0754123456'));
        $this->assertEquals('Mpesa', $gateway->detectOperator('255762456789'));
    }

    public function test_it_detects_airtel_operator()
    {
        $gateway = new AzamPayGateway();
        $this->assertEquals('Airtel', $gateway->detectOperator('0784123456'));
        $this->assertEquals('Airtel', $gateway->detectOperator('255683456789'));
    }

    public function test_it_detects_halopesa_operator()
    {
        $gateway = new AzamPayGateway();
        $this->assertEquals('Halopesa', $gateway->detectOperator('0622123456'));
        $this->assertEquals('Halopesa', $gateway->detectOperator('255620456789'));
    }

    public function test_it_detects_azampesa_operator()
    {
        $gateway = new AzamPayGateway();
        $this->assertEquals('Azampesa', $gateway->detectOperator('0732123456'));
        $this->assertEquals('Azampesa', $gateway->detectOperator('255734456789'));
    }

    public function test_it_returns_null_for_unknown_prefixes()
    {
        $gateway = new AzamPayGateway();
        $this->assertNull($gateway->detectOperator('0999123456'));
        $this->assertNull($gateway->detectOperator('123456'));
    }
}

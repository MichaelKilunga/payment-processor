<?php

namespace App\Services\Gateways;

use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * Get the payment gateway driver name.
     */
    public function getName(): string;

    /**
     * Initiate payment transaction on the gateway.
     */
    public function initiatePayment(array $params): array;

    /**
     * Verify the webhook signature from the gateway.
     */
    public function verifyWebhookSignature(Request $request): bool;

    /**
     * Parse the callback request from the gateway and return unified callback payload format.
     */
    public function parseCallback(Request $request): array;
}

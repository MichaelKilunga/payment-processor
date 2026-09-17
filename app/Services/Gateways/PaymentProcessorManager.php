<?php

namespace App\Services\Gateways;

use App\Models\Config;
use InvalidArgumentException;

class PaymentProcessorManager
{
    protected array $drivers = [
        'selcom' => SelcomGateway::class,
        'azampay' => AzamPayGateway::class,
    ];

    /**
     * Resolve the active payment gateway driver.
     *
     * @param string|null $driver
     * @return PaymentGatewayInterface
     * @throws InvalidArgumentException
     */
    public function getGateway(?string $driver = null): PaymentGatewayInterface
    {
        $driver = $driver ?? Config::getValue('active_gateway', 'selcom');

        if (!isset($this->drivers[$driver])) {
            throw new InvalidArgumentException("Unsupported payment gateway driver: {$driver}");
        }

        return app($this->drivers[$driver]);
    }

    /**
     * Get all registered gateway drivers.
     *
     * @return array
     */
    public function getAvailableDrivers(): array
    {
        return array_keys($this->drivers);
    }
}

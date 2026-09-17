<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Config extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['key', 'value'];

    public static function getValue(string $key, $default = null)
    {
        $config = self::find($key);
        if ($config) {
            return $config->value;
        }

        // Fallback to environment/config files
        switch ($key) {
            case 'active_gateway':
                return env('ACTIVE_PAYMENT_GATEWAY', $default);
            case 'webapp_callback_url':
                return env('WEBAPP_CALLBACK_URL', $default);
            case 'selcom_base_url':
                return config('services.selcom.base_url', $default);
            case 'selcom_api_key':
                return config('services.selcom.api_key', $default);
            case 'selcom_secret_key':
                return config('services.selcom.secret_key', $default);
            case 'selcom_vendor':
                return config('services.selcom.vendor', $default);
            case 'azampay_base_url':
                return config('services.azampay.base_url', $default);
            case 'azampay_auth_base_url':
                return config('services.azampay.auth_base_url', $default);
            case 'azampay_client_id':
                return config('services.azampay.client_id', $default);
            case 'azampay_client_secret':
                return config('services.azampay.client_secret', $default);
            case 'azampay_app_name':
                return config('services.azampay.app_name', $default);
            case 'azampay_api_key':
                return config('services.azampay.api_key', $default);
        }

        return $default;
    }
}

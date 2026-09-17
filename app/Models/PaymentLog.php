<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentLog extends Model
{
    protected $fillable = [
        'external_reference',
        'gateway_reference',
        'gateway',
        'amount',
        'phone',
        'status',
        'raw_request',
        'raw_response',
        'callback_payload',
    ];

    protected $casts = [
        'raw_request' => 'array',
        'raw_response' => 'array',
        'callback_payload' => 'array',
        'amount' => 'float',
    ];
}

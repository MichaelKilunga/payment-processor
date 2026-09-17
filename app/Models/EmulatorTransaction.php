<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmulatorTransaction extends Model
{
    protected $fillable = [
        'gateway',
        'external_id',
        'amount',
        'phone',
        'buyer_name',
        'buyer_email',
        'status',
        'raw_payload',
    ];

    protected $casts = [
        'raw_payload' => 'array',
        'amount'      => 'float',
    ];
}

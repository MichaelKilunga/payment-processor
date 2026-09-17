<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            $table->string('external_reference')->index();
            $table->string('gateway_reference')->nullable()->index();
            $table->string('gateway');
            $table->decimal('amount', 15, 2);
            $table->string('phone');
            $table->string('status')->default('pending'); // pending, success, failed
            $table->json('raw_request')->nullable();
            $table->json('raw_response')->nullable();
            $table->json('callback_payload')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};

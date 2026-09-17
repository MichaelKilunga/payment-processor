<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emulator_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('gateway');                    // selcom | azampay
            $table->string('external_id');               // The reference from the web app
            $table->decimal('amount', 15, 2);
            $table->string('phone');
            $table->string('buyer_name')->nullable();
            $table->string('buyer_email')->nullable();
            $table->string('status')->default('pending'); // pending | approved | rejected | timeout
            $table->json('raw_payload')->nullable();      // Full payload from the processor
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emulator_transactions');
    }
};

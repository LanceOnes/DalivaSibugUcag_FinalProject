<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_token')->nullable()->index();
            $table->string('customer_name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->enum('fulfillment_type', ['pickup', 'delivery']);
            $table->text('delivery_address')->nullable();
            $table->string('delivery_area')->nullable();
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->date('scheduled_date');
            $table->foreignId('time_slot_id')->nullable()->constrained()->nullOnDelete();
            $table->string('scheduled_time')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('total', 10, 2);
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'ready_for_pickup',
                'delivered',
                'cancelled',
            ])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

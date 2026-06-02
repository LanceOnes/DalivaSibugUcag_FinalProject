<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'downpayment_amount')) {
                $table->dropColumn('downpayment_amount');
            }

            if (Schema::hasColumn('orders', 'downpayment_paid')) {
                $table->dropColumn('downpayment_paid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('downpayment_amount', 10, 2)->after('total')->default(0);
            $table->boolean('downpayment_paid')->after('downpayment_amount')->default(false);
        });
    }
};

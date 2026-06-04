<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $max = (int) config('ordering.max_units_per_slot', 4);

        DB::table('time_slots')->update(['max_orders' => $max]);
    }

    public function down(): void
    {
        DB::table('time_slots')->update(['max_orders' => 5]);
    }
};

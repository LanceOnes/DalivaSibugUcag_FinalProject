<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Maximum units per time slot
    |--------------------------------------------------------------------------
    |
    | Each cart line quantity counts as one unit (e.g. qty 2 uses 2 spots).
    |
    */

    'max_units_per_slot' => (int) env('MAX_UNITS_PER_SLOT', env('MAX_ORDERS_PER_SLOT', 4)),

    'delivery_fee' => (int) env('DELIVERY_FEE', 150),

];

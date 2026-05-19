<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'guest_token',
        'customer_name',
        'email',
        'phone',
        'fulfillment_type',
        'delivery_address',
        'delivery_area',
        'delivery_fee',
        'scheduled_date',
        'time_slot_id',
        'scheduled_time',
        'subtotal',
        'total',
        'downpayment_amount',
        'downpayment_paid',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'delivery_fee' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
            'downpayment_amount' => 'decimal:2',
            'downpayment_paid' => 'boolean',
        ];
    }

    public static function generateOrderNumber(): string
    {
        return 'BL-'.strtoupper(Str::random(8));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TimeSlot extends Model
{
    protected $fillable = [
        'slot_date',
        'start_time',
        'end_time',
        'type',
        'max_orders',
        'booked_count',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'slot_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function getAvailableSpotsAttribute(): int
    {
        return max(0, $this->max_orders - $this->booked_count);
    }

    public function getIsFullAttribute(): bool
    {
        return $this->booked_count >= $this->max_orders;
    }
}

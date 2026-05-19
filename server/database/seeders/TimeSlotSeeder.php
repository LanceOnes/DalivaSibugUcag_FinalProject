<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

class TimeSlotSeeder extends Seeder
{
    public function run(): void
    {
        $times = [
            ['09:00', '11:00'],
            ['11:00', '13:00'],
            ['14:00', '16:00'],
            ['16:00', '18:00'],
        ];

        for ($day = 1; $day <= 14; $day++) {
            $date = now()->addDays($day)->toDateString();

            foreach (['pickup', 'delivery'] as $type) {
                foreach ($times as [$start, $end]) {
                    TimeSlot::updateOrCreate(
                        [
                            'slot_date' => $date,
                            'start_time' => $start,
                            'type' => $type,
                        ],
                        [
                            'end_time' => $end,
                            'max_orders' => 5,
                            'booked_count' => 0,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeSlotController extends Controller
{
    public function available(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'type' => ['required', 'in:pickup,delivery'],
            'units_needed' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = TimeSlot::where('slot_date', $validated['date'])
            ->where('type', $validated['type'])
            ->where('is_active', true)
            ->whereColumn('booked_count', '<', 'max_orders');

        if (! empty($validated['units_needed'])) {
            $needed = (int) $validated['units_needed'];
            $query->whereRaw('(max_orders - booked_count) >= ?', [$needed]);
        }

        $slots = $query->orderBy('start_time')->get()
            ->map(function (TimeSlot $slot) {
                $start = substr((string) $slot->start_time, 0, 5);
                $end = substr((string) $slot->end_time, 0, 5);

                return [
                    'id' => $slot->id,
                    'start_time' => $start,
                    'end_time' => $end,
                    'label' => $this->formatTime12($start).' - '.$this->formatTime12($end),
                    'available_spots' => $slot->available_spots,
                    'max_orders' => $slot->max_orders,
                ];
            });

        return response()->json([
            'slots' => $slots,
            'max_units_per_slot' => config('ordering.max_units_per_slot', 4),
        ]);
    }

    private function formatTime12(string $time): string
    {
        [$hours, $minutes] = array_map('intval', explode(':', $time));
        $period = $hours >= 12 ? 'PM' : 'AM';
        $hour12 = $hours % 12 ?: 12;

        return sprintf('%d:%02d %s', $hour12, $minutes, $period);
    }
}

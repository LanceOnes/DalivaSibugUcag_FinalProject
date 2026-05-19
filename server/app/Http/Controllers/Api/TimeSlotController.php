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
        ]);

        $slots = TimeSlot::where('slot_date', $validated['date'])
            ->where('type', $validated['type'])
            ->where('is_active', true)
            ->whereColumn('booked_count', '<', 'max_orders')
            ->orderBy('start_time')
            ->get()
            ->map(fn (TimeSlot $slot) => [
                'id' => $slot->id,
                'start_time' => substr((string) $slot->start_time, 0, 5),
                'end_time' => substr((string) $slot->end_time, 0, 5),
                'label' => substr((string) $slot->start_time, 0, 5).' - '.substr((string) $slot->end_time, 0, 5),
                'available_spots' => $slot->available_spots,
            ]);

        return response()->json(['slots' => $slots]);
    }
}

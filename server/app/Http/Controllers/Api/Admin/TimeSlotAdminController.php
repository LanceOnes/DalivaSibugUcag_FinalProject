<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeSlotAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TimeSlot::query()->orderBy('slot_date')->orderBy('start_time');

        if ($request->filled('from')) {
            $query->where('slot_date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->where('slot_date', '<=', $request->to);
        }

        return response()->json(['slots' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $cap = config('ordering.max_units_per_slot', 4);

        $validated = $request->validate([
            'slot_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'type' => ['required', 'in:pickup,delivery'],
            'max_orders' => ['integer', 'min:1', 'max:'.$cap],
            'is_active' => ['boolean'],
        ]);

        $validated['max_orders'] = $validated['max_orders'] ?? $cap;

        $slot = TimeSlot::create($validated);

        return response()->json(['slot' => $slot], 201);
    }

    public function update(Request $request, TimeSlot $timeSlot): JsonResponse
    {
        $cap = config('ordering.max_units_per_slot', 4);

        $validated = $request->validate([
            'slot_date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'type' => ['sometimes', 'in:pickup,delivery'],
            'max_orders' => ['integer', 'min:1', 'max:'.$cap],
            'is_active' => ['boolean'],
        ]);

        $timeSlot->update($validated);

        return response()->json(['slot' => $timeSlot]);
    }

    public function destroy(TimeSlot $timeSlot): JsonResponse
    {
        $timeSlot->delete();

        return response()->json(['message' => 'Slot deleted']);
    }

    public function calendar(Request $request): JsonResponse
    {
        $from = $request->get('from', now()->toDateString());
        $to = $request->get('to', now()->addDays(30)->toDateString());

        $slots = TimeSlot::whereBetween('slot_date', [$from, $to])
            ->withCount('orders')
            ->orderBy('slot_date')
            ->orderBy('start_time')
            ->get()
            ->groupBy(fn ($s) => $s->slot_date->format('Y-m-d'));

        return response()->json(['calendar' => $slots]);
    }
}

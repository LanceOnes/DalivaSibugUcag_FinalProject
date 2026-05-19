<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
  /** Roxas City delivery zones — simple flat fees */
    private const ZONES = [
        'lawaan' => 80,
        'baybay' => 100,
        'bayawan' => 100,
        'banica' => 100,
        'barra' => 120,
        'culajao' => 120,
        'dumolog' => 120,
        'punta cogon' => 120,
        'roxas city' => 100,
        'tiza' => 100,
        'linambas' => 150,
        'cogon' => 100,
        'default' => 150,
    ];

    public function calculateFee(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'address' => ['required', 'string'],
            'area' => ['nullable', 'string'],
        ]);

        $search = strtolower($validated['area'] ?? $validated['address']);
        $fee = self::ZONES['default'];
        $matchedZone = 'Nearby Roxas City';

        foreach (self::ZONES as $zone => $zoneFee) {
            if ($zone === 'default') {
                continue;
            }
            if (str_contains($search, $zone)) {
                $fee = $zoneFee;
                $matchedZone = ucwords($zone);
                break;
            }
        }

        return response()->json([
            'delivery_fee' => $fee,
            'zone' => $matchedZone,
            'message' => 'Delivery available within Roxas City and nearby areas.',
        ]);
    }

    public function zones(): JsonResponse
    {
        $zones = collect(self::ZONES)
            ->except('default')
            ->map(fn ($fee, $name) => [
                'name' => ucwords($name),
                'fee' => $fee,
            ])
            ->values();

        return response()->json(['zones' => $zones, 'default_fee' => self::ZONES['default']]);
    }
}

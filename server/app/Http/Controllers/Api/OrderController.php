<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Support\ResolvesSanctumUser;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\TimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    use ResolvesSanctumUser;

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['required', 'string', 'max:20'],
            'fulfillment_type' => ['required', 'in:pickup,delivery'],
            'delivery_address' => ['required_if:fulfillment_type,delivery', 'nullable', 'string'],
            'delivery_area' => ['nullable', 'string'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:'.now()->addDay()->toDateString()],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'scheduled_time' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $this->sanctumUser($request);

        return DB::transaction(function () use ($request, $validated, $user) {
            $subtotal = 0;
            $lineItems = [];

            foreach ($validated['items'] as $item) {
                $line = $this->resolveLineItem($item);
                $subtotal += $line['line_total'];
                $lineItems[] = $line;
            }

            $deliveryFee = $validated['fulfillment_type'] === 'delivery'
                ? (float) config('ordering.delivery_fee', 150)
                : 0;

            $total = $subtotal + $deliveryFee;

            $unitsRequested = (int) collect($validated['items'])->sum('quantity');
            $maxUnits = config('ordering.max_units_per_slot', 4);

            $slot = TimeSlot::lockForUpdate()->findOrFail($validated['time_slot_id']);

            if (! $slot->is_active) {
                return response()->json([
                    'message' => 'This time slot is no longer available. Please choose another schedule.',
                ], 422);
            }

            if ($slot->booked_count + $unitsRequested > $slot->max_orders) {
                $remaining = max(0, $slot->max_orders - $slot->booked_count);

                return response()->json([
                    'message' => "This time slot only has {$remaining} spot(s) left (max {$maxUnits} per slot). Reduce your cart quantity or choose another time.",
                ], 422);
            }
            $slot->increment('booked_count', $unitsRequested);

            $guestToken = $user ? null : Str::uuid()->toString();

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user?->id,
                'guest_token' => $guestToken,
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'] ?? $user?->email,
                'phone' => $validated['phone'],
                'fulfillment_type' => $validated['fulfillment_type'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_area' => $validated['delivery_area'] ?? null,
                'delivery_fee' => $deliveryFee,
                'scheduled_date' => $validated['scheduled_date'],
                'time_slot_id' => $validated['time_slot_id'] ?? null,
                'scheduled_time' => $validated['scheduled_time'] ?? null,
                'subtotal' => $subtotal,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
            ]);

            foreach ($lineItems as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    ...$line,
                ]);
            }

            $order->load('items', 'timeSlot');

            return response()->json([
                'order' => $order,
                'guest_token' => $guestToken,
                'message' => 'Order placed! We will confirm the schedule shortly.',
            ], 201);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items')->latest();
        $user = $this->sanctumUser($request);

        if ($user) {
            Order::whereNull('user_id')
                ->where('email', $user->email)
                ->update(['user_id' => $user->id, 'guest_token' => null]);

            $guestToken = $request->header('X-Guest-Token');
            $query->where(function ($q) use ($user, $guestToken) {
                $q->where('user_id', $user->id);
                if ($guestToken) {
                    $q->orWhere(function ($q2) use ($guestToken) {
                        $q2->where('guest_token', $guestToken)->whereNull('user_id');
                    });
                }
            });
        } else {
            $guestToken = $request->header('X-Guest-Token');
            if (empty($guestToken)) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 100,
                    'total' => 0,
                ]);
            }
            $query->where('guest_token', $guestToken)->whereNull('user_id');
        }

        return response()->json($query->paginate(100));
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $this->sanctumUser($request);

        if (! $user?->isAdmin() && (int) $order->user_id !== (int) $user?->id) {
            $guestToken = $request->header('X-Guest-Token');
            if (! $guestToken || $order->guest_token !== $guestToken || $order->user_id !== null) {
                return response()->json(['message' => 'Not found'], 404);
            }
        }

        $order->load('items', 'timeSlot');

        return response()->json(['order' => $order]);
    }

    private function resolveLineItem(array $item): array
    {
        if (! empty($item['product_variant_id'])) {
            $variant = ProductVariant::with('product')->findOrFail($item['product_variant_id']);
            $unitPrice = (float) $variant->price;
            $qty = (int) $item['quantity'];

            return [
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'item_name' => $variant->product->name,
                'size_label' => $variant->size_label,
                'unit_price' => $unitPrice,
                'quantity' => $qty,
                'line_total' => $unitPrice * $qty,
            ];
        }

        $product = Product::findOrFail($item['product_id']);
        $unitPrice = (float) $product->price;
        $qty = (int) $item['quantity'];

        return [
            'product_id' => $product->id,
            'product_variant_id' => null,
            'item_name' => $product->name,
            'size_label' => null,
            'unit_price' => $unitPrice,
            'quantity' => $qty,
            'line_total' => $unitPrice * $qty,
        ];
    }
}

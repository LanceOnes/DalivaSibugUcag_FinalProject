<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items', 'user', 'timeSlot'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('scheduled_date', $request->date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(10));
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items', 'user', 'timeSlot']);

        return response()->json(['order' => $order]);
    }

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
            'status' => ['sometimes', 'in:pending,confirmed,preparing,ready_for_pickup,delivered,cancelled'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = DB::transaction(function () use ($validated) {
            $lineItems = [];
            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                if (empty($item['product_variant_id']) && empty($item['product_id'])) {
                    throw new HttpResponseException(response()->json([
                        'message' => 'Each line item must reference a product or variant.',
                    ], 422));
                }
                $line = $this->resolveLineItem($item);
                $lineItems[] = $line;
                $subtotal += $line['line_total'];
            }

            $unitsRequested = (int) collect($validated['items'])->sum('quantity');
            $deliveryFee = $validated['fulfillment_type'] === 'delivery'
                ? (float) ($validated['delivery_fee'] ?? config('ordering.delivery_fee', 150))
                : 0;
            $total = $subtotal + $deliveryFee;
            $status = $validated['status'] ?? 'pending';

            if ($status !== 'cancelled') {
                $this->bookSlot((int) $validated['time_slot_id'], $unitsRequested);
            }

            $userId = null;
            if (! empty($validated['email'])) {
                $userId = User::where('email', $validated['email'])->where('role', 'customer')->value('id');
            }

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $userId,
                'guest_token' => null,
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'],
                'fulfillment_type' => $validated['fulfillment_type'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_area' => $validated['delivery_area'] ?? null,
                'delivery_fee' => $deliveryFee,
                'scheduled_date' => $validated['scheduled_date'],
                'time_slot_id' => $validated['time_slot_id'],
                'scheduled_time' => $validated['scheduled_time'] ?? null,
                'subtotal' => $subtotal,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
                'status' => $status,
            ]);

            foreach ($lineItems as $line) {
                OrderItem::create(['order_id' => $order->id, ...$line]);
            }

            return $order;
        });

        return response()->json([
            'order' => $order->load(['items', 'user', 'timeSlot']),
            'message' => 'Order created successfully.',
        ], 201);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,preparing,ready_for_pickup,delivered,cancelled'],
        ]);

        $previousStatus = $order->status;
        $newStatus = $validated['status'];

        DB::transaction(function () use ($order, $validated, $previousStatus, $newStatus) {
            $order->update($validated);

            if ($order->time_slot_id && $previousStatus !== 'cancelled' && $newStatus === 'cancelled') {
                $units = (int) $order->items()->sum('quantity');
                if ($units > 0) {
                    TimeSlot::where('id', $order->time_slot_id)
                        ->where('booked_count', '>=', $units)
                        ->decrement('booked_count', $units);
                }
            }
        });

        return response()->json(['order' => $order->fresh()->load('items')]);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'fulfillment_type' => ['sometimes', 'in:pickup,delivery'],
            'delivery_address' => ['nullable', 'string'],
            'delivery_area' => ['nullable', 'string'],
            'scheduled_date' => ['sometimes', 'date'],
            'time_slot_id' => ['nullable', 'exists:time_slots,id'],
            'scheduled_time' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:pending,confirmed,preparing,ready_for_pickup,delivered,cancelled'],
            'notes' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($order, $validated) {
            $oldUnits = (int) $order->items()->sum('quantity');
            $lineItems = null;
            $subtotal = null;

            if (isset($validated['items'])) {
                $lineItems = [];
                $subtotal = 0;

                foreach ($validated['items'] as $item) {
                    if (empty($item['product_variant_id']) && empty($item['product_id'])) {
                        throw new HttpResponseException(response()->json([
                            'message' => 'Each line item must reference a product or variant.',
                        ], 422));
                    }

                    $line = $this->resolveLineItem($item);
                    $lineItems[] = $line;
                    $subtotal += $line['line_total'];
                }
            }

            $newUnits = $lineItems
                ? (int) array_sum(array_column($lineItems, 'quantity'))
                : $oldUnits;

            $oldStatus = $order->status;
            $newStatus = $validated['status'] ?? $oldStatus;
            $oldSlotId = $order->time_slot_id;
            $newSlotId = array_key_exists('time_slot_id', $validated)
                ? $validated['time_slot_id']
                : $oldSlotId;

            $wasActive = $oldStatus !== 'cancelled';
            $willBeActive = $newStatus !== 'cancelled';

            $sameSlot = $oldSlotId && $newSlotId && (int) $oldSlotId === (int) $newSlotId;

            if ($wasActive && $willBeActive && $sameSlot && $oldUnits !== $newUnits) {
                $delta = $newUnits - $oldUnits;
                if ($delta > 0) {
                    $this->bookSlot((int) $newSlotId, $delta);
                } else {
                    $this->releaseSlot((int) $oldSlotId, abs($delta));
                }
            } else {
                if ($wasActive && $oldSlotId && (! $sameSlot || ! $willBeActive)) {
                    $this->releaseSlot($oldSlotId, $oldUnits);
                }

                if ($willBeActive && $newSlotId && (! $wasActive || ! $sameSlot)) {
                    $this->bookSlot((int) $newSlotId, $newUnits);
                }
            }

            $orderFields = collect($validated)->except('items')->toArray();

            if ($lineItems !== null) {
                $order->items()->delete();

                foreach ($lineItems as $line) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        ...$line,
                    ]);
                }

                $deliveryFee = (float) $order->delivery_fee;
                $orderFields['subtotal'] = $subtotal;
                $orderFields['total'] = $subtotal + $deliveryFee;
            }

            $order->update($orderFields);
        });

        return response()->json([
            'order' => $order->fresh()->load(['items', 'user', 'timeSlot']),
        ]);
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

    private function releaseSlot(?int $slotId, int $units): void
    {
        if (! $slotId || $units <= 0) {
            return;
        }

        TimeSlot::where('id', $slotId)
            ->where('booked_count', '>=', $units)
            ->decrement('booked_count', $units);
    }

    private function bookSlot(int $slotId, int $units): void
    {
        if ($units <= 0) {
            return;
        }

        $slot = TimeSlot::lockForUpdate()->findOrFail($slotId);

        if (! $slot->is_active) {
            throw new HttpResponseException(response()->json([
                'message' => 'This time slot is not available.',
            ], 422));
        }

        if ($slot->booked_count + $units > $slot->max_orders) {
            throw new HttpResponseException(response()->json([
                'message' => 'The selected time slot does not have enough capacity for this order.',
            ], 422));
        }

        $slot->increment('booked_count', $units);
    }
}

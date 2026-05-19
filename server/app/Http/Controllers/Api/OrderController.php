<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            'time_slot_id' => ['nullable', 'exists:time_slots,id'],
            'scheduled_time' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $subtotal = 0;
            $lineItems = [];

            foreach ($validated['items'] as $item) {
                $line = $this->resolveLineItem($item);
                $subtotal += $line['line_total'];
                $lineItems[] = $line;
            }

            $deliveryFee = $validated['fulfillment_type'] === 'delivery'
                ? (float) ($validated['delivery_fee'] ?? 0)
                : 0;

            $total = $subtotal + $deliveryFee;
            $downpayment = round($total * 0.5, 2);

            if (! empty($validated['time_slot_id'])) {
                $slot = TimeSlot::lockForUpdate()->findOrFail($validated['time_slot_id']);
                if ($slot->is_full) {
                    return response()->json(['message' => 'Selected time slot is fully booked.'], 422);
                }
                $slot->increment('booked_count');
            }

            $guestToken = $request->user() ? null : Str::uuid()->toString();

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $request->user()?->id,
                'guest_token' => $guestToken,
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'] ?? $request->user()?->email,
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
                'downpayment_amount' => $downpayment,
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
                'message' => 'Order placed! 50% downpayment (₱'.number_format($downpayment, 2).') required to confirm.',
            ], 201);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $order->load('items', 'timeSlot');

        return response()->json(['order' => $order]);
    }

    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => ['required_without:guest_token', 'string'],
            'guest_token' => ['required_without:order_number', 'string'],
        ]);

        $query = Order::with('items', 'timeSlot');

        if (! empty($validated['order_number'])) {
            $query->where('order_number', $validated['order_number']);
        }

        if (! empty($validated['guest_token'])) {
            $query->where('guest_token', $validated['guest_token']);
        }

        $order = $query->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

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

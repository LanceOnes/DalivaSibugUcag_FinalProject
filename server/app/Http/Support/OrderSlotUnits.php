<?php

namespace App\Http\Support;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;

class OrderSlotUnits
{
    /**
     * Only belly (pork) items consume a time-slot spot.
     */
    public static function fromPayloadItems(array $items): int
    {
        $units = 0;

        foreach ($items as $item) {
            $qty = (int) ($item['quantity'] ?? 0);
            if ($qty <= 0) {
                continue;
            }

            if (! empty($item['product_variant_id'])) {
                $units += $qty;

                continue;
            }

            if (! empty($item['product_id'])) {
                $product = Product::find($item['product_id']);
                if ($product && $product->category === 'belly') {
                    $units += $qty;
                }
            }
        }

        return $units;
    }

    /**
     * @param  array<int, array<string, mixed>>  $lineItems
     */
    public static function fromResolvedLineItems(array $lineItems): int
    {
        $units = 0;

        foreach ($lineItems as $line) {
            $qty = (int) ($line['quantity'] ?? 0);
            if ($qty <= 0) {
                continue;
            }

            if (! empty($line['product_variant_id'])) {
                $units += $qty;

                continue;
            }

            if (! empty($line['product_id'])) {
                $product = Product::find($line['product_id']);
                if ($product && $product->category === 'belly') {
                    $units += $qty;
                }
            }
        }

        return $units;
    }

    public static function fromOrderItems(iterable $items): int
    {
        $units = 0;

        foreach ($items as $item) {
            if (! $item instanceof OrderItem) {
                continue;
            }

            $qty = (int) $item->quantity;
            if ($qty <= 0) {
                continue;
            }

            if ($item->product_variant_id) {
                $units += $qty;

                continue;
            }

            if ($item->product_id) {
                $product = Product::find($item->product_id);
                if ($product && $product->category === 'belly') {
                    $units += $qty;
                }
            }
        }

        return $units;
    }
}

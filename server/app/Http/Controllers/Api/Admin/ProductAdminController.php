<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with('variants')->orderBy('sort_order')->get();

        return response()->json(['products' => $products]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'category' => ['required', 'in:belly,addon,drink'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
            'variants' => ['nullable', 'array'],
            'variants.*.size_label' => ['required_with:variants', 'string'],
            'variants.*.servings' => ['nullable', 'string'],
            'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.is_active' => ['boolean'],
        ]);

        $product = Product::create([
            ...$validated,
            'slug' => Str::slug($validated['name']).'-'.Str::random(4),
        ]);

        if (! empty($validated['variants'])) {
            foreach ($validated['variants'] as $i => $variant) {
                $product->variants()->create([
                    ...$variant,
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json(['product' => $product->load('variants')], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'category' => ['sometimes', 'in:belly,addon,drink'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'exists:product_variants,id'],
            'variants.*.size_label' => ['required_with:variants', 'string'],
            'variants.*.servings' => ['nullable', 'string'],
            'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.is_active' => ['boolean'],
            'delete_variant_ids' => ['nullable', 'array'],
            'delete_variant_ids.*' => ['exists:product_variants,id'],
        ]);

        $product->update(collect($validated)->except(['variants', 'delete_variant_ids'])->toArray());

        if (! empty($validated['delete_variant_ids'])) {
            ProductVariant::where('product_id', $product->id)
                ->whereIn('id', $validated['delete_variant_ids'])
                ->delete();
        }

        if (isset($validated['variants'])) {
            foreach ($validated['variants'] as $i => $variantData) {
                if (! empty($variantData['id'])) {
                    ProductVariant::where('id', $variantData['id'])
                        ->where('product_id', $product->id)
                        ->update(collect($variantData)->except('id')->merge(['sort_order' => $i])->toArray());
                } else {
                    $product->variants()->create([
                        ...collect($variantData)->except('id')->toArray(),
                        'sort_order' => $i,
                    ]);
                }
            }
        }

        return response()->json(['product' => $product->fresh()->load('variants')]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->deleteStoredPicture($product->product_picture);
        $product->variants()->delete();
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    public function uploadImage(Request $request, Product $product): JsonResponse
    {
        if ($product->category === 'belly') {
            return response()->json(['message' => 'Pictures are not supported for boneless lechon belly.'], 422);
        }

        $validated = $request->validate([
            'product_picture' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ]);

        $this->deleteStoredPicture($product->product_picture);

        $path = $validated['product_picture']->store('products', 'public');
        $product->update(['product_picture' => $path]);

        return response()->json(['product' => $product->fresh()->load('variants')]);
    }

    public function deleteImage(Product $product): JsonResponse
    {
        if ($product->category === 'belly') {
            return response()->json(['message' => 'Pictures are not supported for boneless lechon belly.'], 422);
        }

        $this->deleteStoredPicture($product->product_picture);
        $product->update(['product_picture' => null]);

        return response()->json(['product' => $product->fresh()->load('variants')]);
    }

    private function deleteStoredPicture(?string $path): void
    {
        if (! $path) {
            return;
        }

        if (str_starts_with($path, 'products/') && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}

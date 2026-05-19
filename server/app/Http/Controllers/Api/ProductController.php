<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['activeVariants'])
            ->where('is_active', true)
            ->orderBy('sort_order');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(['products' => $query->get()]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('activeVariants');

        return response()->json(['product' => $product]);
    }

    public function menu(): JsonResponse
    {
        $belly = Product::with('activeVariants')
            ->where('category', 'belly')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $addons = Product::where('category', 'addon')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $drinks = Product::where('category', 'drink')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'belly' => $belly,
            'addons' => $addons,
            'drinks' => $drinks,
        ]);
    }
}

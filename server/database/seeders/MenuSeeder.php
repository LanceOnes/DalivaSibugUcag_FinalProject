<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $belly = Product::updateOrCreate(
            ['name' => 'Boneless Lechon Belly'],
            [
                'description' => 'Crispy-skinned, tender boneless lechon belly — our signature BELLYlicious roast. Perfect for family gatherings and celebrations in Roxas City.',
                'image' => '/images/belly-hero.jpg',
                'category' => 'belly',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $variants = [
            ['size_label' => 'Small', 'servings' => '4-6 persons', 'price' => 1800, 'sort_order' => 1],
            ['size_label' => 'Medium', 'servings' => '8-10 persons', 'price' => 2200, 'sort_order' => 2],
            ['size_label' => 'Large', 'servings' => '12-15 persons', 'price' => 2800, 'sort_order' => 3],
            ['size_label' => 'Party Tray', 'servings' => '20-25 persons', 'price' => 4500, 'sort_order' => 4],
        ];

        foreach ($variants as $v) {
            ProductVariant::updateOrCreate(
                ['product_id' => $belly->id, 'size_label' => $v['size_label']],
                [...$v, 'is_active' => true]
            );
        }

        $addons = [
            ['name' => 'Lechon Sauce', 'price' => 80, 'description' => 'Rich homemade lechon sauce', 'category' => 'addon'],
            ['name' => 'Spiced Vinegar', 'price' => 60, 'description' => 'Sinamak-style spiced vinegar dip', 'category' => 'addon'],
            ['name' => 'Steamed Rice (Tray)', 'price' => 250, 'description' => 'Good for 10 servings', 'category' => 'addon'],
            ['name' => 'Iced Tea Pitcher', 'price' => 120, 'description' => 'Refreshing house-blend iced tea', 'category' => 'drink'],
        ];

        foreach ($addons as $i => $addon) {
            Product::updateOrCreate(
                ['name' => $addon['name']],
                [
                    'description' => $addon['description'],
                    'category' => $addon['category'],
                    'price' => $addon['price'],
                    'is_active' => true,
                    'sort_order' => $i + 1,
                ]
            );
        }
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    protected $appends = ['product_picture_url'];

    protected $fillable = [
        'product_picture',
        'name',
        'slug',
        'description',
        'image',
        'category',
        'price',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    public function activeVariants(): HasMany
    {
        return $this->variants()->where('is_active', true);
    }

    public function getProductPictureUrlAttribute(): ?string
    {
        if (! $this->product_picture) {
            return null;
        }

        if (str_starts_with($this->product_picture, 'http://') || str_starts_with($this->product_picture, 'https://')) {
            return $this->product_picture;
        }

        $path = str_starts_with($this->product_picture, 'products/')
            ? $this->product_picture
            : ltrim($this->product_picture, '/');

        return Storage::disk('public')->url($path);
    }
}

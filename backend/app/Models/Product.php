<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'type_number',
        'product_name',
    ];

    public function recyclings(): HasMany
    {
        return $this->hasMany(Recycling::class, 'product');
    }
}

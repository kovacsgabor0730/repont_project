<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recycling extends Model
{
    use HasFactory;

    protected $table = 'recycling';

    public $timestamps = false;
    
    protected $casts = [
        'event_date' => 'datetime',
    ];

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class, 'machine');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product');
    }
}

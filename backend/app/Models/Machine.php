<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Machine extends Model
{
use HasFactory;

    protected $table = 'machines';

    public $timestamps = false; 

    protected $fillable = [
        'name',
        'installation_date',
        'postal_code',
        'public_space_name',
        'public_space_type',
        'house_number',
    ];

    protected $casts = [
        'installation_date' => 'datetime',
    ];

    public function recyclings(): HasMany
    {
        return $this->hasMany(Recycling::class, 'machine');
    }
}
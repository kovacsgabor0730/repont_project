<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Machine extends Model
{
    use HasFactory;

    protected $table = 'machines';

    protected $fillable = [
        'name',
        'installation_date',
        'postal_code',
        'public_space_name',
        'public_space_type',
        'house_number',
    ];

    public function recyclings(): HasMany
    {
        return $this->hasMany(Recycling::class, 'machine');
    }
}

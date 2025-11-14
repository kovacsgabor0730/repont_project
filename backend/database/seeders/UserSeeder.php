<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        if (!User::where('email', 'test@example.com')->exists()) {
            User::create([
                'name' => 'Teszt Felhasználó',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]);
        }
    }
}
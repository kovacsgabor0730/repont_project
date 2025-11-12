<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run()
    {
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Repont Teszt User',
                'password' => Hash::make('password'),
            ]
        );

        $user->tokens()->delete();
        $token = $user->createToken('simple-test-token')->plainTextToken;

        echo $token . "\n";
    }
}
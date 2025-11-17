<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User; 
use Illuminate\Support\Facades\Auth;

class SocialAuthController extends Controller
{

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }


    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::firstOrCreate(
                [
                    'google_id' => $googleUser->getId(),
                ],
                [
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => \Hash::make(\Str::random(24)),
                ]
            );

            $token = $user->createToken('authToken')->plainTextToken; 
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            
            return redirect("{$frontendUrl}/auth/callback?token={$token}");

        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=auth_failed');
        }
    }
}
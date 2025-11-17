<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\RecyclingController;
use App\Http\Controllers\SocialAuthController; 

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/google', [SocialAuthController::class, 'redirectToGoogle']);

Route::get('/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/machines', [RecyclingController::class, 'getMachines']);
    Route::get('/leaderboard', [RecyclingController::class, 'getLeaderboard']);
    Route::get('/events', [RecyclingController::class, 'getEvents']);
    
    Route::post('/logout', [AuthController::class, 'logout']);
});
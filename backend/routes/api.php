<?php

use Illuminate\Support\Facades\Route;
// Feltételezve, hogy a Controllerek az App\Http\Controllers mappában vannak:
use App\Http\Controllers\AuthController; 
use App\Http\Controllers\RecyclingController; 

Route::post('/login', [AuthController::class, 'login'])->name('login');

// --- 2. Védett Útvonalak (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/machines', [RecyclingController::class, 'getMachines']);
    Route::get('/leaderboard', [RecyclingController::class, 'getLeaderboard']);
    Route::get('/events', [RecyclingController::class, 'getEvents']);
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
});
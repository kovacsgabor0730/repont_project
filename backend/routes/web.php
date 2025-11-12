<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecyclingController; 

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/machines', [RecyclingController::class, 'getMachines']);
    Route::get('/leaderboard', [RecyclingController::class, 'getLeaderboard']);
    Route::get('/events', [RecyclingController::class, 'getEvents']);

});
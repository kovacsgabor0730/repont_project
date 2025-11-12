<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecyclingController; 

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and all of them 
| will be assigned the "api" middleware group. Make something great!
|
*/

// A hitelesítés kihagyása a tesztelés idejére (ahogy kérted)
// Ha visszakapcsolod az auth-ot, ezt a Route::middleware('auth:sanctum') blokkba kell tenni.

Route::get('/machines', [RecyclingController::class, 'getMachines']);
Route::get('/leaderboard', [RecyclingController::class, 'getLeaderboard']);
Route::get('/events', [RecyclingController::class, 'getEvents']);

<?php

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\OrderAdminController;
use App\Http\Controllers\Api\Admin\ProductAdminController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\TimeSlotAdminController;
use App\Http\Controllers\Api\Admin\UserAdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TimeSlotController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => 'BELLYlicious Lawaan API']));


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/menu', [ProductController::class, 'menu']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/time-slots/available', [TimeSlotController::class, 'available']);
Route::post('/delivery/calculate', [DeliveryController::class, 'calculateFee']);
Route::get('/delivery/zones', [DeliveryController::class, 'zones']);

Route::post('/orders', [OrderController::class, 'store']);
Route::post('/orders/track', [OrderController::class, 'track']);


Route::middleware('auth:sanctum')->group(function () { // user or customer
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
});


Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () { //admin 
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('products', ProductAdminController::class);
    Route::get('/orders', [OrderAdminController::class, 'index']);
    Route::get('/orders/{order}', [OrderAdminController::class, 'show']);
    Route::patch('/orders/{order}/status', [OrderAdminController::class, 'updateStatus']);

    Route::get('/time-slots', [TimeSlotAdminController::class, 'index']);
    Route::get('/time-slots/calendar', [TimeSlotAdminController::class, 'calendar']);
    Route::post('/time-slots', [TimeSlotAdminController::class, 'store']);
    Route::put('/time-slots/{timeSlot}', [TimeSlotAdminController::class, 'update']);
    Route::delete('/time-slots/{timeSlot}', [TimeSlotAdminController::class, 'destroy']);

    Route::get('/users', [UserAdminController::class, 'index']);
    Route::put('/users/{user}', [UserAdminController::class, 'update']);
    Route::delete('/users/{user}', [UserAdminController::class, 'destroy']);

    Route::get('/reports', [ReportController::class, 'summary']);
});

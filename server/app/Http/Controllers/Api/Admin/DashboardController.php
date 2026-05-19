<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->toDateString();

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $todayRevenue = Order::whereDate('created_at', $today)
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $monthRevenue = Order::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $statusBreakdown = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $recentOrders = Order::with('items')
            ->latest()
            ->limit(8)
            ->get();

        $totalCustomers = User::where('role', 'customer')->count();

        return response()->json([
            'stats' => [
                'today_orders' => $todayOrders,
                'pending_orders' => $pendingOrders,
                'today_revenue' => (float) $todayRevenue,
                'month_revenue' => (float) $monthRevenue,
                'total_customers' => $totalCustomers,
            ],
            'status_breakdown' => $statusBreakdown,
            'recent_orders' => $recentOrders,
        ]);
    }
}

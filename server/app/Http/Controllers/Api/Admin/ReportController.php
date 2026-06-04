<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());
        $period = $request->get('period', 'daily');

        $orders = Order::whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled']);

        $totalRevenue = (clone $orders)->sum('total');
        $totalOrders = (clone $orders)->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $dailyRevenue = Order::whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total) as revenue'), DB::raw('COUNT(*) as orders'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->whereNotIn('orders.status', ['cancelled'])
            ->select('order_items.item_name', 'order_items.size_label', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.line_total) as revenue'))
            ->groupBy('order_items.item_name', 'order_items.size_label')
            ->orderByDesc('qty')
            ->limit(10)
            ->get();

        $fulfillmentSplit = Order::whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->select('fulfillment_type', DB::raw('count(*) as count'))
            ->groupBy('fulfillment_type')
            ->pluck('count', 'fulfillment_type');

        $fulfillmentTracking = $period === 'monthly'
            ? $this->fulfillmentByMonth($from, $to)
            : $this->fulfillmentByDay($from, $to);

        return response()->json([
            'from' => $from,
            'to' => $to,
            'period' => $period,
            'total_revenue' => (float) $totalRevenue,
            'total_orders' => $totalOrders,
            'avg_order_value' => round($avgOrderValue, 2),
            'daily_revenue' => $dailyRevenue,
            'top_products' => $topProducts,
            'fulfillment_split' => $fulfillmentSplit,
            'fulfillment_tracking' => $fulfillmentTracking,
        ]);
    }

    private function fulfillmentByDay(string $from, string $to)
    {
        return Order::whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->select(
                DB::raw('DATE(created_at) as period'),
                DB::raw("SUM(CASE WHEN fulfillment_type = 'pickup' THEN 1 ELSE 0 END) as pickup_count"),
                DB::raw("SUM(CASE WHEN fulfillment_type = 'delivery' THEN 1 ELSE 0 END) as delivery_count"),
                DB::raw('COUNT(*) as total_count'),
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }

    private function fulfillmentByMonth(string $from, string $to)
    {
        return Order::whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->whereNotIn('status', ['cancelled'])
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as period"),
                DB::raw("SUM(CASE WHEN fulfillment_type = 'pickup' THEN 1 ELSE 0 END) as pickup_count"),
                DB::raw("SUM(CASE WHEN fulfillment_type = 'delivery' THEN 1 ELSE 0 END) as delivery_count"),
                DB::raw('COUNT(*) as total_count'),
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }
}

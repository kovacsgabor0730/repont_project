<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Recycling;
use App\Models\Machine;
use App\Models\Product;

class RecyclingController extends Controller
{
    public function getLeaderboard(Request $request)
    {
        $request->validate([
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after_or_equal:start_time',
            'machine_id' => 'required|string',
        ]);

        $machineId = $request->input('machine_id');
        $start = $request->start_time;
        $end = $request->end_time;

        $query = Recycling::select('product')
            ->where('event_type', 'success')
            ->whereBetween('event_date', [$start, $end])
            ->when(is_numeric($machineId), fn($q) => $q->where('machine', (int)$machineId))
            ->groupBy('product')
            ->selectRaw('COUNT(*) as total_count')
            ->orderByDesc('total_count')
            ->get();

        $productIds = $query->pluck('product')->unique();
        $products = Product::whereIn('id', $productIds)
            ->pluck('product_name', 'id');

        $leaderboard = $query->map(fn($item) => [
            'product_name' => $products[$item->product] ?? 'Unknown',
            'total_count' => $item->total_count,
        ]);

        return response()->json($leaderboard);
    }

public function getEvents(Request $request)
    {
        $request->validate([
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after_or_equal:start_time',
            'beverage_type' => 'required|string',
            'machine_id' => 'required|string',
            'last_id' => 'nullable|integer'
        ]);

        $machineId = $request->input('machine_id');
        $start = $request->start_time;
        $end = $request->end_time;
        $beverageType = $request->input('beverage_type');
        $lastId = $request->input('last_id');

        $productId = Product::where('product_name', $beverageType)->value('id');

        if (!$productId) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $query = Recycling::where('product', $productId)
            ->whereBetween('event_date', [$start, $end])
            ->when(is_numeric($machineId), fn($q) => $q->where('machine', (int)$machineId))
            ->orderByDesc('id')
            ->select('id', 'machine', 'product', 'event_type', 'event_date');

        if ($lastId) {
            $query->where('id', '<', $lastId);
        }

        $events = $query->limit(50)->get();

        $nextCursor = $events->last()?->id;

        return response()->json([
            'data' => $events,
            'next_cursor' => $nextCursor
        ]);
    }

    public function getMachines()
    {
        $machines = Machine::all(['id', 'name']);
        $machines->prepend(['id' => 'all', 'name' => 'Összes automata']);

        return response()->json($machines);
    }
}

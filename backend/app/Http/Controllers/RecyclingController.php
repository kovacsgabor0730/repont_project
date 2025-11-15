<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Recycling;
use App\Models\Machine;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class RecyclingController extends Controller
{
    public function getLeaderboard(Request $request)
    {
        $request->validate([
            'start_time' => 'required|date_format:Y-m-d H:i:s', 
            'end_time' => 'required|date_format:Y-m-d H:i:s|after_or_equal:start_time',
            'machine_id' => 'required|string',
        ]);

        $query = Recycling::select(
            'products.product_name',
            DB::raw('COUNT(recycling.id) as total_count')
        )
        ->whereBetween('recycling.event_date', [$request->start_time, $request->end_time])
        ->where('recycling.event_type', 'success') 
        ->join('products', 'recycling.product', '=', 'products.id')
        ->groupBy('products.product_name')
        ->orderByDesc('total_count');

        if ($request->input('machine_id') !== 'all' && is_numeric($request->input('machine_id'))) {
            $query->where('recycling.machine', (int)$request->input('machine_id'));
        }

        $leaderboard = $query->get();

        return response()->json($leaderboard);
    }
    
    public function getEvents(Request $request)
    {
        $request->validate([
            'start_time' => 'required|date_format:Y-m-d H:i:s', 
            'end_time' => 'required|date_format:Y-m-d H:i:s|after_or_equal:start_time',
            'beverage_type' => 'required|string',
            'machine_id' => 'required|string', 
        ]);
        
        $beverageType = $request->input('beverage_type');

        $product = Product::where('product_name', $beverageType)->first();
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $query = Recycling::with(['product', 'machine'])
            ->where('product', $product->id)
            ->whereBetween('event_date', [$request->start_time, $request->end_time])
            ->select('id', 'machine', 'product', 'event_type', 'event_date') 
            ->orderBy('event_date', 'desc');

        if ($request->input('machine_id') !== 'all' && is_numeric($request->input('machine_id'))) {
             $query->where('machine', (int)$request->input('machine_id'));
        }
        
        $events = $query->paginate(50);
 
        return response()->json($events);
    }

    public function getMachines()
    {
        $machines = Machine::all(['id', 'name']);
        
        $machines->prepend(['id' => 'all', 'name' => 'Összes automata']); 

        return response()->json($machines);
    }
}
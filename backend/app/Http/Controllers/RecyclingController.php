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
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'machine_id' => 'nullable|integer',
        ]);

        $query = Recycling::select(
            'products.product_name',
            DB::raw('COUNT(recycling.id) as total_count')
        )
        ->where('recycling.event_type', 'success') 
        ->whereBetween('recycling.event_date', [$request->start_date, $request->end_date])
        ->join('products', 'recycling.product', '=', 'products.id')
        ->groupBy('products.product_name')
        ->orderByDesc('total_count');

        if ($request->filled('machine_id') && $request->input('machine_id') != 0) {
            $query->where('recycling.machine', $request->machine_id);
        }

        $leaderboard = $query->get();

        return response()->json($leaderboard);
    }
    public function getEvents(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d H:i:s', 
            'end_date' => 'required|date_format:Y-m-d H:i:s|after_or_equal:start_date',
            'product_id' => 'required|integer', 
            'machine_id' => 'nullable|integer', 
        ]);

        $start_date = $request->input('start_date');
        $end_date = $request->input('end_date');
    
        $query = Recycling::with(['product', 'machine'])
            ->where('product', $request->product_id)
            ->whereBetween('event_date', [$request->start_date, $request->end_date])
            ->orderBy('event_date', 'desc');

        if ($request->filled('machine_id') && $request->input('machine_id') != 0) {
            $query->where('machine', $request->machine_id);
        }
        
        $events = $query->paginate(50);
 
        return response()->json($events);
    }

    public function getMachines()
    {
        $machines = Machine::all(['id', 'name']);
        
        $machines->prepend(['id' => 0, 'name' => 'Összes automata']);

        return response()->json($machines);
    }
}
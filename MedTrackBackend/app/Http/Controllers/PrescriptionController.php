<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Prescription::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'doctor_id'      => 'required|exists:users,id',
            'details'        => 'required|string',
        ]);

        $prescription = Prescription::create($fields);
        return response()->json($prescription, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Prescription $prescription)
    {
        return response()->json($prescription);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Prescription $prescription)
    {
        $fields = $request->validate([
            'appointment_id' => 'sometimes|exists:appointments,id',
            'doctor_id'      => 'sometimes|exists:users,id',
            'details'        => 'sometimes|string',
        ]);

        $prescription->update($fields);
        return response()->json($prescription);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prescription $prescription)
    {
        $prescription->delete();
        return response()->json(['message' => 'Prescription deleted successfully']);
    }
}

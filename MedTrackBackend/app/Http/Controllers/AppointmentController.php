<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Appointment::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id'  => 'required|exists:users,id',
            'date'       => 'required|date',
            'status'     => 'nullable|in:pending,approved,rejected,completed'
        ]);

        if (!isset($fields['status'])) {
            $fields['status'] = 'pending';
        }

        $appointment = Appointment::create($fields);
        return response()->json($appointment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        return response()->json($appointment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        $fields = $request->validate([
            'patient_id' => 'sometimes|exists:users,id',
            'doctor_id'  => 'sometimes|exists:users,id',
            'date'       => 'sometimes|date',
            'status'     => 'sometimes|in:pending,approved,rejected,completed'
        ]);

        $appointment->update($fields);
        return response()->json($appointment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(['message' => 'Appointment deleted successfully']);
    }
}

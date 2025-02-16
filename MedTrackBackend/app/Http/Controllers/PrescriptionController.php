<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrescriptionController extends Controller
{
    /**
     * Get perscription for specific appointment
     */
    public function getPrescription($appointment_id)
    {
        $appointment = Appointment::where('id', $appointment_id)->where('patient_id', Auth::id())->firstOrFail();

        $prescription = Prescription::where('appointment_id', $appointment_id)->first();
        
        if (!$prescription) {
            return response()->json(['message' => 'No prescription found for this appointment.'], 404);
        }

        return response()->json($prescription);
    }
}
 // /**
    //  * Display a listing of the resource.
    //  */
    // public function index()
    // {
    //     return response()->json(Prescription::all());
    // }

    // /**
    //  * Store a newly created resource in storage.
    //  */
    // public function store(Request $request)
    // {
    //     $fields = $request->validate([
    //         'appointment_id' => 'required|exists:appointments,id',
    //         'doctor_id'      => 'required|exists:users,id',
    //         'details'        => 'required|string',
    //     ]);

    //     $prescription = Prescription::create($fields);
    //     return response()->json($prescription, 201);
    // }

    // /**
    //  * Display the specified resource.
    //  */
    // public function show(Prescription $prescription)
    // {
    //     return response()->json($prescription);

    // }

    // /**
    //  * Update the specified resource in storage.
    //  */
    // public function update(Request $request, Prescription $prescription)
    // {
    //     $fields = $request->validate([
    //         'appointment_id' => 'sometimes|exists:appointments,id',
    //         'doctor_id'      => 'sometimes|exists:users,id',
    //         'details'        => 'sometimes|string',
    //     ]);

    //     $prescription->update($fields);
    //     return response()->json($prescription);
    // }

    // /**
    //  * Remove the specified resource from storage.
    //  */
    // public function destroy(Prescription $prescription)
    // {
    //     $prescription->delete();
    //     return response()->json(['message' => 'Prescription deleted successfully']);
    // }
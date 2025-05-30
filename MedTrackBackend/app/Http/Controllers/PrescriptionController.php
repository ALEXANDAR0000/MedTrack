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
     /**
     * Add prescription
     */
    public function addPrescription(Request $request, $patient_id)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'details' => 'required|string',
        ]);

        $prescription = Prescription::create([
            'appointment_id' => $request->appointment_id,
            'doctor_id' => Auth::id(),
            'details' => $request->details,
        ]);

        return response()->json(['message' => 'Prescription added successfully.', 'prescription' => $prescription], 201);
    }

    /**
     * Delete prescription
     */
    public function deletePrescription($id)
    {
        $prescription = Prescription::findOrFail($id);
        
        $prescription->delete();

        return response()->json(['message' => 'Prescription deleted successfully.']);
    }
}

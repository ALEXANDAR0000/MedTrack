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

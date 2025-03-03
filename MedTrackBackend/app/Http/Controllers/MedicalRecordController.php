<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicalRecordController extends Controller
{
   /**
     * Medical recor of patient
     */
    public function getPatientMedicalRecord($id)
    {
        $records = MedicalRecord::where('patient_id', $id)->get();
        return response()->json($records);
    }
     /**
     * Add medical record
     */
    public function addMedicalRecord(Request $request, $id)
    {
        $request->validate([
            'notes' => 'required|string',
        ]);

        $medicalRecord = MedicalRecord::create([
            'patient_id' => $id,
            'notes' => $request->notes,
        ]);

        return response()->json(['message' => 'Medical record added successfully.', 'medical_record' => $medicalRecord], 201);
    }

    /**
     * Delete medical record
     */
    public function deleteMedicalRecord($id)
    {
        $medicalRecord = MedicalRecord::findOrFail($id);
        
        $medicalRecord->delete();

        return response()->json(['message' => 'Medical record deleted successfully.']);
    }
}
 
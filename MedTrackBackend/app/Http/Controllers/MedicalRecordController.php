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
    
}
 
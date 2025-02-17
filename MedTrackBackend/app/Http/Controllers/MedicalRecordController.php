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
 // /**
    //  * Display a listing of the resource.
    //  */
    // public function index()
    // {
    //     return response()->json(MedicalRecord::all());
    // }

    // /**
    //  * Store a newly created resource in storage.
    //  */
    // public function store(Request $request)
    // {
    //     $fields = $request->validate([
    //         'patient_id' => 'required|exists:users,id',
    //         'notes'      => 'required|string',
    //     ]);

    //     $record = MedicalRecord::create($fields);
    //     return response()->json($record, 201);
    // }

    // /**
    //  * Display the specified resource.
    //  */
    // public function show(MedicalRecord $medicalRecord)
    // {
    //     return response()->json($medicalRecord);
    // }

    // /**
    //  * Update the specified resource in storage.
    //  */
    // public function update(Request $request, MedicalRecord $medicalRecord)
    // {
    //     $fields = $request->validate([
    //         'notes' => 'sometimes|string',
    //     ]);

    //     $medicalRecord->update($fields);
    //     return response()->json($medicalRecord);
    // }

    // /**
    //  * Remove the specified resource from storage.
    //  */
    // public function destroy(MedicalRecord $medicalRecord)
    // {
    //     $medicalRecord->delete();
    //     return response()->json(['message' => 'Medical record deleted successfully']);
    // }
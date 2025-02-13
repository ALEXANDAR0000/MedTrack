<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(MedicalRecord::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'patient_id' => 'required|exists:users,id',
            'notes'      => 'required|string',
        ]);

        $record = MedicalRecord::create($fields);
        return response()->json($record, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(MedicalRecord $medicalRecord)
    {
        return response()->json($medicalRecord);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        $fields = $request->validate([
            'notes' => 'sometimes|string',
        ]);

        $medicalRecord->update($fields);
        return response()->json($medicalRecord);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MedicalRecord $medicalRecord)
    {
        $medicalRecord->delete();
        return response()->json(['message' => 'Medical record deleted successfully']);
    }
}

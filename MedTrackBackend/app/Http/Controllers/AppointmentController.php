<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;


class AppointmentController extends Controller
{
  /**
     * Creating new appointment
     */
    public function scheduleAppointment(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date|after:today',
        ]);

        $appointment = Appointment::create([
            'patient_id' => Auth::id(),
            'doctor_id' => $request->doctor_id,
            'date' => $request->date,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Appointment scheduled successfully', 'appointment' => $appointment], 201);
    }
    /**
     * Showing user appointments
     */
    public function getMyAppointments()
    {
        $appointments = Appointment::where('patient_id', Auth::id())
            ->with('doctor:id,first_name,last_name')
            ->orderBy('date', 'asc')
            ->get();
    
        return response()->json($appointments);
    }
    
    /**
     * Cancel appointment
     */
    public function cancelAppointment($id)
    {
        $appointment = Appointment::where('id', $id)->where('patient_id', Auth::id())->firstOrFail();

        if ($appointment->status !== 'rejected') {
            return response()->json(['message' => 'Only pending appointments can be canceled.'], 403);
        }

        $appointment->delete();

        return response()->json(['message' => 'Appointment canceled successfully.']);
    }
    /**
     * Check avalivable appointments
     */
    public function getAvailableAppointments($doctor_id, $date)
    {
        $date = Carbon::parse($date)->startOfDay();
        
        $existingAppointments = Appointment::where('doctor_id', $doctor_id)
            ->whereDate('date', $date)
            ->pluck('date')
            ->toArray();

        $availableSlots = [
            '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
        ];

        $availableAppointments = array_filter($availableSlots, function ($time) use ($existingAppointments, $date) {
            return !in_array($date->copy()->setTimeFromTimeString($time), $existingAppointments);
        });

        return response()->json(['available_slots' => array_values($availableAppointments)]);
    }
    /**
     * Shows doctor all his appointments
     */
    public function getDoctorAppointments()
{
    $appointments = Appointment::where('doctor_id', Auth::id())
        ->with('patient:id,first_name,last_name')  
        ->get();

    return response()->json($appointments);
}

     /**
     * Update appointment status
     */
    public function updateAppointmentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $appointment = Appointment::where('id', $id)->where('doctor_id', Auth::id())->firstOrFail();
        
        if ($appointment->status !== 'pending') {
            return response()->json(['message' => 'Only pending appointments can be updated.'], 403);
        }

        $appointment->status = $request->status;
        $appointment->save();

        return response()->json(['message' => 'Appointment status updated successfully.', 'appointment' => $appointment]);
    }
    /**
     * Start appointment
     */
    public function startAppointment($id)
    {
        $appointment = Appointment::where('id', $id)->where('doctor_id', Auth::id())->firstOrFail();

        if ($appointment->status !== 'approved') {
            return response()->json(['message' => 'Only approved appointments can be started.'], 403);
        }

        $appointment->status = 'in_progress';
        $appointment->save();

        return response()->json(['message' => 'Appointment started.', 'appointment' => $appointment]);
    }

    /**
     * Finish appointment
     */
    public function finishAppointment(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)->where('doctor_id', Auth::id())->firstOrFail();

        if ($appointment->status !== 'in_progress') {
            return response()->json(['message' => 'Only in-progress appointments can be finished.'], 403);
        }

        $request->validate([
            'notes' => 'required|string',
            'prescription' => 'required|string',
        ]);

        MedicalRecord::create([
            'patient_id' => $appointment->patient_id,
            'notes' => $request->notes,
        ]);

        Prescription::create([
            'appointment_id' => $appointment->id,
            'doctor_id' => Auth::id(),
            'details' => $request->prescription,
        ]);

        $appointment->status = 'completed';
        $appointment->save();

        return response()->json(['message' => 'Appointment completed.', 'appointment' => $appointment]);
    }

    /**
     * Mark as NoShow
     */
    public function markAsNoShow($id)
    {
        $appointment = Appointment::where('id', $id)->where('doctor_id', Auth::id())->firstOrFail();

        if ($appointment->status !== 'in_progress') {
            return response()->json(['message' => 'Only in_progress appointments can be marked as no-show.'], 403);
        }

        MedicalRecord::create([
            'patient_id' => $appointment->patient_id,
            'notes' => 'Patient did not show up for the appointment.',
        ]);

        Prescription::create([
            'appointment_id' => $appointment->id,
            'doctor_id' => Auth::id(),
            'details' => 'No prescription issued. Patient was absent.',
        ]);

        $appointment->status = 'completed';
        $appointment->save();

        return response()->json(['message' => 'Appointment marked as no-show.', 'appointment' => $appointment]);
    }
}

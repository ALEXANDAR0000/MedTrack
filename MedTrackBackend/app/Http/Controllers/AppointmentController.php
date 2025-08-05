<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Models\AppointmentTimeSlot;
use App\Services\TimeSlotService;
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
            'time_slot_id' => 'required|exists:appointment_time_slots,id',
        ]);

        $timeSlotService = new TimeSlotService();

        try {
            // Get the time slot
            $timeSlot = AppointmentTimeSlot::findOrFail($request->time_slot_id);
            
            // Verify the slot belongs to the requested doctor
            if ($timeSlot->doctor_id != $request->doctor_id) {
                return response()->json(['message' => 'Time slot does not belong to the selected doctor'], 422);
            }
            
            // Check if slot is available
            if (!$timeSlot->is_available || $timeSlot->appointment_id || $timeSlot->isReserved()) {
                return response()->json(['message' => 'This time slot is no longer available'], 422);
            }

            // Create the appointment
            $appointment = Appointment::create([
                'patient_id' => Auth::id(),
                'doctor_id' => $request->doctor_id,
                'date' => $timeSlot->date,
                'start_time' => $timeSlot->start_time,
                'end_time' => $timeSlot->end_time,
                'status' => 'pending',
            ]);

            // Book the time slot
            $timeSlotService->bookSlot($request->time_slot_id, $appointment->id);

            return response()->json([
                'message' => 'Appointment scheduled successfully', 
                'appointment' => $appointment->load('doctor:id,first_name,last_name')
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
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

        if ($appointment->status !== 'pending') {
            return response()->json(['message' => 'Only pending appointments can be canceled.'], 403);
        }

        // Release the time slot
        $timeSlot = AppointmentTimeSlot::where('appointment_id', $appointment->id)->first();
        if ($timeSlot) {
            $timeSlotService = new TimeSlotService();
            $timeSlotService->releaseSlot($timeSlot->id);
        }

        $appointment->delete();

        return response()->json(['message' => 'Appointment canceled successfully.']);
    }
    /**
     * Check available appointments
     */
    public function getAvailableAppointments($doctor_id, $date)
    {
        $timeSlotService = new TimeSlotService();
        
        try {
            $availableSlots = $timeSlotService->getAvailableSlots($doctor_id, $date);
            
            $slots = $availableSlots->map(function ($slot) {
                return [
                    'id' => $slot->id,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'date' => $slot->date,
                ];
            });
            
            return response()->json(['available_slots' => $slots]);
            
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
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

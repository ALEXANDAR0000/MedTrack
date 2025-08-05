<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Models\DoctorSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;


class AppointmentController extends Controller
{
  /**
     * Create new appointment
     */
    public function scheduleAppointment(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        try {
            // Check if this time slot is already booked
            $existingAppointment = Appointment::where('doctor_id', $request->doctor_id)
                ->where('date', $request->date)
                ->where('start_time', $request->start_time)
                ->first();

            if ($existingAppointment) {
                return response()->json(['message' => 'This time slot is no longer available'], 422);
            }

            // Verify the doctor is available at this time
            $dayOfWeek = Carbon::parse($request->date)->dayOfWeek;
            $schedule = DoctorSchedule::forDoctor($request->doctor_id)
                ->forDay($dayOfWeek)
                ->active()
                ->first();

            if (!$schedule) {
                return response()->json(['message' => 'Doctor is not available on this day'], 422);
            }

            // Check if the requested time is within doctor's working hours
            if ($request->start_time < $schedule->start_time || $request->end_time > $schedule->end_time) {
                return response()->json(['message' => 'Requested time is outside doctor\'s working hours'], 422);
            }

            // Create the appointment
            $appointment = Appointment::create([
                'patient_id' => Auth::id(),
                'doctor_id' => $request->doctor_id,
                'date' => $request->date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'pending',
            ]);

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

        // No need to release time slots in simplified system - just delete appointment

        $appointment->delete();

        return response()->json(['message' => 'Appointment canceled successfully.']);
    }
    /**
     * Get available appointment slots for a doctor on a specific date
     */
    public function getAvailableAppointments($doctor_id, $date)
    {
        try {
            $dayOfWeek = Carbon::parse($date)->dayOfWeek;
            
            // Get doctor's schedule for this day
            $schedule = DoctorSchedule::forDoctor($doctor_id)
                ->forDay($dayOfWeek)
                ->active()
                ->first();
            
            if (!$schedule) {
                return response()->json(['available_slots' => []]);
            }
            
            // Generate time slots for this day
            $slots = $this->generateSlotsForDay($schedule, $date);
            
            // Get existing appointments for this doctor and date
            $bookedTimes = Appointment::where('doctor_id', $doctor_id)
                ->whereDate('date', $date)
                ->pluck('start_time')
                ->map(function($time) {
                    // Convert datetime or time to just HH:MM format
                    return Carbon::parse($time)->format('H:i');
                })
                ->toArray();
            
            // Filter out booked slots
            $availableSlots = $slots->reject(function($slot) use ($bookedTimes) {
                return in_array($slot['start_time'], $bookedTimes);
            });
            
            
            return response()->json(['available_slots' => $availableSlots->values()]);
            
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Generate time slots for a specific day based on doctor's schedule
     */
    private function generateSlotsForDay($schedule, $date)
    {
        $slots = collect();
        $startTime = Carbon::parse($date . ' ' . $schedule->start_time);
        $endTime = Carbon::parse($date . ' ' . $schedule->end_time);
        $slotDuration = $schedule->slot_duration;
        
        $current = $startTime->copy();
        $slotId = 1; // Simple incremental ID for frontend
        
        while ($current->lt($endTime)) {
            $slotEnd = $current->copy()->addMinutes($slotDuration);
            
            if ($slotEnd->lte($endTime)) {
                $slots->push([
                    'id' => $slotId++,
                    'start_time' => $current->format('H:i'),
                    'end_time' => $slotEnd->format('H:i'),
                    'date' => $date,
                ]);
            }
            
            $current = $slotEnd;
        }
        
        return $slots;
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

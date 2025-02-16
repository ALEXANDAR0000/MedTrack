<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
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
        $appointments = Appointment::where('patient_id', Auth::id())->get();
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
}
  // /**
    //  * Display a listing of the resource.
    //  */
    // public function index()
    // {
    //     return response()->json(Appointment::all());
    // }

    // /**
    //  * Store a newly created resource in storage.
    //  */
    // public function store(Request $request)
    // {
    //     $fields = $request->validate([
    //         'patient_id' => 'required|exists:users,id',
    //         'doctor_id'  => 'required|exists:users,id',
    //         'date'       => 'required|date',
    //         'status'     => 'nullable|in:pending,approved,rejected,completed'
    //     ]);

    //     if (!isset($fields['status'])) {
    //         $fields['status'] = 'pending';
    //     }

    //     $appointment = Appointment::create($fields);
    //     return response()->json($appointment, 201);
    // }

    // /**
    //  * Display the specified resource.
    //  */
    // public function show(Appointment $appointment)
    // {
    //     return response()->json($appointment);
    // }

    // /**
    //  * Update the specified resource in storage.
    //  */
    // public function update(Request $request, Appointment $appointment)
    // {
    //     $fields = $request->validate([
    //         'patient_id' => 'sometimes|exists:users,id',
    //         'doctor_id'  => 'sometimes|exists:users,id',
    //         'date'       => 'sometimes|date',
    //         'status'     => 'sometimes|in:pending,approved,rejected,completed'
    //     ]);

    //     $appointment->update($fields);
    //     return response()->json($appointment);
    // }

    // /**
    //  * Remove the specified resource from storage.
    //  */
    // public function destroy(Appointment $appointment)
    // {
    //     $appointment->delete();
    //     return response()->json(['message' => 'Appointment deleted successfully']);
    // }
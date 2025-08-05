<?php

namespace App\Http\Controllers;

use App\Models\DoctorSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorScheduleController extends Controller
{
    /**
     * Get doctor's weekly schedule
     */
    public function getSchedule()
    {
        $schedule = DoctorSchedule::forDoctor(Auth::id())
            ->orderBy('day_of_week')
            ->get();

        // Create array for all 7 days, fill with existing data or defaults
        $weeklySchedule = [];
        for ($day = 0; $day < 7; $day++) {
            $existingDay = $schedule->where('day_of_week', $day)->first();
            
            $weeklySchedule[] = [
                'day_of_week' => $day,
                'day_name' => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][$day],
                'start_time' => $existingDay ? $existingDay->start_time : '09:00',
                'end_time' => $existingDay ? $existingDay->end_time : '17:00',
                'slot_duration' => $existingDay ? $existingDay->slot_duration : 60,
                'is_active' => $existingDay ? $existingDay->is_active : false,
                'id' => $existingDay ? $existingDay->id : null,
            ];
        }

        return response()->json(['schedule' => $weeklySchedule]);
    }

    /**
     * Update entire weekly schedule
     */
    public function updateSchedule(Request $request)
    {
        $request->validate([
            'schedule' => 'required|array|size:7',
            'schedule.*.day_of_week' => 'required|integer|between:0,6',
            'schedule.*.start_time' => 'required|date_format:H:i',
            'schedule.*.end_time' => 'required|date_format:H:i|after:schedule.*.start_time',
            'schedule.*.slot_duration' => 'required|integer|min:15|max:240',
            'schedule.*.is_active' => 'required|boolean',
        ]);

        $doctorId = Auth::id();

        // Update or create each day's schedule
        foreach ($request->schedule as $dayData) {
            DoctorSchedule::updateOrCreate(
                [
                    'doctor_id' => $doctorId,
                    'day_of_week' => $dayData['day_of_week']
                ],
                [
                    'start_time' => $dayData['start_time'],
                    'end_time' => $dayData['end_time'],
                    'slot_duration' => $dayData['slot_duration'],
                    'is_active' => $dayData['is_active'],
                ]
            );
        }

        return response()->json(['message' => 'Schedule updated successfully']);
    }

    /**
     * Update specific day schedule
     */
    public function updateDay(Request $request)
    {
        $request->validate([
            'day_of_week' => 'required|integer|between:0,6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'slot_duration' => 'required|integer|min:15|max:240',
            'is_active' => 'required|boolean',
        ]);

        $schedule = DoctorSchedule::updateOrCreate(
            [
                'doctor_id' => Auth::id(),
                'day_of_week' => $request->day_of_week
            ],
            [
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'slot_duration' => $request->slot_duration,
                'is_active' => $request->is_active,
            ]
        );

        return response()->json([
            'message' => 'Day schedule updated successfully',
            'schedule' => $schedule
        ]);
    }
}
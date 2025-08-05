<?php

namespace App\Http\Controllers;

use App\Models\DoctorAvailabilityRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DoctorAvailabilityController extends Controller
{
    /**
     * Get doctor's availability rules (templates and exceptions)
     */
    public function getAvailability()
    {
        $doctorId = Auth::id();
        
        $templates = DoctorAvailabilityRule::where('doctor_id', $doctorId)
            ->templates()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
            
        $exceptions = DoctorAvailabilityRule::where('doctor_id', $doctorId)
            ->exceptions()
            ->where('specific_date', '>=', now()->toDateString())
            ->orderBy('specific_date')
            ->orderBy('start_time')
            ->get();
            
        return response()->json([
            'templates' => $templates,
            'exceptions' => $exceptions
        ]);
    }

    /**
     * Create or update weekly template rule
     */
    public function createOrUpdateTemplate(Request $request)
    {
        $request->validate([
            'day_of_week' => 'required|integer|between:0,6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'required|boolean',
            'slot_duration' => 'required|integer|min:15|max:240',
            'reason' => 'nullable|string|max:255'
        ]);

        $doctorId = Auth::id();

        // Check for overlapping templates on the same day (excluding exact match we might be updating)
        $overlapping = DoctorAvailabilityRule::where('doctor_id', $doctorId)
            ->where('rule_type', 'template')
            ->where('day_of_week', $request->day_of_week)
            ->where(function ($query) use ($request) {
                // Exclude exact match (for updates)
                $query->where('start_time', '!=', $request->start_time);
            })
            ->where(function ($query) use ($request) {
                // Check for actual time overlaps
                $query->where(function ($q) use ($request) {
                    // Overlap: new start < existing end AND new end > existing start
                    $q->where('start_time', '<', $request->end_time)
                      ->where('end_time', '>', $request->start_time);
                });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'message' => 'This time period overlaps with an existing template for this day',
                'errors' => ['time' => ['Cannot create overlapping availability templates']]
            ], 422);
        }

        $rule = DoctorAvailabilityRule::updateOrCreate(
            [
                'doctor_id' => $doctorId,
                'rule_type' => 'template',
                'day_of_week' => $request->day_of_week,
                'start_time' => $request->start_time,
            ],
            [
                'end_time' => $request->end_time,
                'is_available' => $request->is_available,
                'slot_duration' => $request->slot_duration,
                'reason' => $request->reason,
            ]
        );

        return response()->json([
            'message' => 'Availability template saved successfully',
            'rule' => $rule
        ]);
    }

    /**
     * Create exception rule for specific date
     */
    public function createException(Request $request)
    {
        $request->validate([
            'specific_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'required|boolean',
            'slot_duration' => 'required_if:is_available,true|integer|min:15|max:240',
            'reason' => 'required|string|max:255'
        ]);

        $doctorId = Auth::id();

        try {
            // Handle the unique constraint by ensuring only one exception per date
            $rule = DB::transaction(function () use ($doctorId, $request) {
                // Delete all existing exceptions for this date first
                DoctorAvailabilityRule::where('doctor_id', $doctorId)
                    ->where('rule_type', 'exception')
                    ->where('specific_date', $request->specific_date)
                    ->delete();

                // Now create the new exception (no constraint violation possible)
                return DoctorAvailabilityRule::create([
                    'doctor_id' => $doctorId,
                    'rule_type' => 'exception',
                    'specific_date' => $request->specific_date,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                    'is_available' => $request->is_available,
                    'slot_duration' => $request->slot_duration ?? 60,
                    'reason' => $request->reason,
                ]);
            });
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            \Log::error('Exception creation constraint violation: ' . $e->getMessage());
            return response()->json([
                'message' => 'You already have an exception for this date and time. Please choose a different time or delete the existing exception first.',
                'errors' => ['general' => ['An exception for this date and time already exists']]
            ], 422);
        }

        return response()->json([
            'message' => 'Exception created successfully',
            'rule' => $rule
        ], 201);
    }

    /**
     * Update existing availability rule
     */
    public function updateRule(Request $request, $id)
    {
        $rule = DoctorAvailabilityRule::where('id', $id)
            ->where('doctor_id', Auth::id())
            ->firstOrFail();

        $validationRules = [
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'required|boolean',
            'slot_duration' => 'required|integer|min:15|max:240',
            'reason' => 'nullable|string|max:255'
        ];

        if ($rule->rule_type === 'template') {
            $validationRules['day_of_week'] = 'required|integer|between:0,6';
        } else {
            $validationRules['specific_date'] = 'required|date|after_or_equal:today';
        }

        $request->validate($validationRules);

        $rule->update($request->only([
            'day_of_week', 'specific_date', 'start_time', 'end_time', 
            'is_available', 'slot_duration', 'reason'
        ]));

        return response()->json([
            'message' => 'Availability rule updated successfully',
            'rule' => $rule
        ]);
    }

    /**
     * Delete availability rule
     */
    public function deleteRule($id)
    {
        $rule = DoctorAvailabilityRule::where('id', $id)
            ->where('doctor_id', Auth::id())
            ->firstOrFail();

        $rule->delete();

        return response()->json([
            'message' => 'Availability rule deleted successfully'
        ]);
    }

    /**
     * Get weekly template for a specific day
     */
    public function getDayTemplate($dayOfWeek)
    {
        $rules = DoctorAvailabilityRule::where('doctor_id', Auth::id())
            ->templates()
            ->where('day_of_week', $dayOfWeek)
            ->orderBy('start_time')
            ->get();

        return response()->json($rules);
    }

    /**
     * Bulk update weekly schedule
     */
    public function updateWeeklySchedule(Request $request)
    {
        $request->validate([
            'schedule' => 'required|array',
            'schedule.*.day_of_week' => 'required|integer|between:0,6',
            'schedule.*.periods' => 'required|array',
            'schedule.*.periods.*.start_time' => 'required|date_format:H:i',
            'schedule.*.periods.*.end_time' => 'required|date_format:H:i|after:schedule.*.periods.*.start_time',
            'schedule.*.periods.*.is_available' => 'required|boolean',
            'schedule.*.periods.*.slot_duration' => 'required|integer|min:15|max:240',
        ]);

        $doctorId = Auth::id();

        // Start transaction for bulk update
        \DB::transaction(function () use ($request, $doctorId) {
            foreach ($request->schedule as $daySchedule) {
                $dayOfWeek = $daySchedule['day_of_week'];
                
                // Delete existing templates for this day
                DoctorAvailabilityRule::where('doctor_id', $doctorId)
                    ->where('rule_type', 'template')
                    ->where('day_of_week', $dayOfWeek)
                    ->delete();

                // Create new templates for this day
                foreach ($daySchedule['periods'] as $period) {
                    DoctorAvailabilityRule::create([
                        'doctor_id' => $doctorId,
                        'rule_type' => 'template',
                        'day_of_week' => $dayOfWeek,
                        'start_time' => $period['start_time'],
                        'end_time' => $period['end_time'],
                        'is_available' => $period['is_available'],
                        'slot_duration' => $period['slot_duration'],
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Weekly schedule updated successfully'
        ]);
    }
}

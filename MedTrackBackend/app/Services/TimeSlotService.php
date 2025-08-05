<?php

namespace App\Services;

use App\Models\DoctorAvailabilityRule;
use App\Models\AppointmentTimeSlot;
use Carbon\Carbon;

class TimeSlotService
{
    /**
     * Generate time slots for a doctor for a specific date
     */
    public function generateSlotsForDate($doctorId, $date)
    {
        $date = Carbon::parse($date);
        $dayOfWeek = $date->dayOfWeek;
        
        // First, check for exceptions on this specific date
        $exceptions = DoctorAvailabilityRule::forDoctorAndDate($doctorId, $date)
            ->orderBy('start_time')
            ->get();
            
        if ($exceptions->isNotEmpty()) {
            // Use exceptions instead of templates
            return $this->generateSlotsFromRules($doctorId, $date, $exceptions);
        }
        
        // No exceptions, use weekly template
        $templates = DoctorAvailabilityRule::forDoctorAndDay($doctorId, $dayOfWeek)
            ->orderBy('start_time')
            ->get();
            
        if ($templates->isEmpty()) {
            // No availability rules defined for this day
            return collect();
        }
        
        return $this->generateSlotsFromRules($doctorId, $date, $templates);
    }

    /**
     * Generate time slots from availability rules
     */
    private function generateSlotsFromRules($doctorId, $date, $rules)
    {
        $slots = collect();
        
        foreach ($rules as $rule) {
            if (!$rule->is_available) {
                // Skip unavailable periods (vacation, sick days, etc.)
                continue;
            }
            
            $periodSlots = $this->generateSlotsForPeriod(
                $doctorId,
                $date,
                $rule->start_time,
                $rule->end_time,
                $rule->slot_duration
            );
            
            $slots = $slots->merge($periodSlots);
        }
        
        return $slots;
    }

    /**
     * Generate individual slots for a time period
     */
    private function generateSlotsForPeriod($doctorId, $date, $startTime, $endTime, $slotDuration)
    {
        $slots = collect();
        $dateString = Carbon::parse($date)->format('Y-m-d');
        $slotStart = Carbon::parse($dateString . ' ' . $startTime);
        $slotEnd = Carbon::parse($dateString . ' ' . $endTime);
    
        while ($slotStart->lt($slotEnd)) {
            $nextSlot = $slotStart->copy()->addMinutes($slotDuration);
    
            // Try to find existing slot first
            $slot = AppointmentTimeSlot::where('doctor_id', $doctorId)
                ->where('date', $dateString)
                ->where('start_time', $slotStart->format('H:i'))
                ->first();
                
            // If not found, create new one
            if (!$slot) {
                try {
                    $slot = AppointmentTimeSlot::create([
                        'doctor_id' => $doctorId,
                        'date' => $dateString,
                        'start_time' => $slotStart->format('H:i'),
                        'end_time' => $nextSlot->format('H:i'),
                        'is_available' => true,
                    ]);
                } catch (\Illuminate\Database\QueryException $e) {
                    // If constraint violation, try to find the slot again (race condition)
                    if (str_contains($e->getMessage(), 'UNIQUE constraint failed')) {
                        $slot = AppointmentTimeSlot::where('doctor_id', $doctorId)
                            ->where('date', $dateString)
                            ->where('start_time', $slotStart->format('H:i'))
                            ->first();
                    } else {
                        throw $e;
                    }
                }
            }
            
            if ($slot) {
                $slots->push($slot);
            }
    
            $slotStart = $nextSlot;
        }
    
        return $slots;
    }    

    /**
     * Generate slots for multiple dates
     */
    public function generateSlotsForDateRange($doctorId, $startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $allSlots = collect();
        
        while ($start->lte($end)) {
            $daySlots = $this->generateSlotsForDate($doctorId, $start);
            $allSlots = $allSlots->merge($daySlots);
            $start->addDay();
        }
        
        return $allSlots;
    }

    /**
     * Get available slots for a doctor on a specific date
     */
    public function getAvailableSlots($doctorId, $date)
    {
        // Clean up expired reservations first
        AppointmentTimeSlot::cleanupExpiredReservations();
        
        // Generate slots if they don't exist
        $this->generateSlotsForDate($doctorId, $date);
        
        // Return available slots
        return AppointmentTimeSlot::forDoctor($doctorId)
            ->forDate($date)
            ->available()
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Reserve a time slot temporarily
     */
    public function reserveSlot($slotId, $minutes = 15)
    {
        $slot = AppointmentTimeSlot::findOrFail($slotId);
        
        if (!$slot->is_available || $slot->appointment_id || $slot->isReserved()) {
            throw new \Exception('This time slot is not available for reservation');
        }
        
        $slot->reserve($minutes);
        return $slot;
    }

    /**
     * Book a time slot for an appointment
     */
    public function bookSlot($slotId, $appointmentId)
    {
        $slot = AppointmentTimeSlot::findOrFail($slotId);
        
        if (!$slot->is_available || $slot->appointment_id) {
            throw new \Exception('This time slot is not available for booking');
        }
        
        $slot->bookForAppointment($appointmentId);
        return $slot;
    }

    /**
     * Release a time slot (when appointment is cancelled)
     */
    public function releaseSlot($slotId)
    {
        $slot = AppointmentTimeSlot::findOrFail($slotId);
        $slot->release();
        return $slot;
    }

    /**
     * Regenerate slots for a doctor when availability rules change
     */
    public function regenerateSlotsForDoctor($doctorId, $fromDate = null)
    {
        $fromDate = $fromDate ? Carbon::parse($fromDate) : Carbon::today();
        $toDate = $fromDate->copy()->addDays(90); // Generate for next 3 months
        
        // Delete existing future slots that are not booked
        AppointmentTimeSlot::where('doctor_id', $doctorId)
            ->where('date', '>=', $fromDate->toDateString())
            ->whereNull('appointment_id')
            ->delete();
            
        // Generate new slots
        return $this->generateSlotsForDateRange($doctorId, $fromDate, $toDate);
    }

    /**
     * Get doctor's schedule summary for a date range
     */
    public function getDoctorScheduleSummary($doctorId, $startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $summary = [];
        
        while ($start->lte($end)) {
            $slots = AppointmentTimeSlot::forDoctor($doctorId)
                ->forDate($start)
                ->get();
                
            $summary[$start->toDateString()] = [
                'date' => $start->toDateString(),
                'day_of_week' => $start->dayOfWeek,
                'total_slots' => $slots->count(),
                'available_slots' => $slots->where('is_available', true)->whereNull('appointment_id')->count(),
                'booked_slots' => $slots->whereNotNull('appointment_id')->count(),
                'slots' => $slots->map(function ($slot) {
                    return [
                        'id' => $slot->id,
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                        'is_available' => $slot->is_available && !$slot->appointment_id,
                        'is_booked' => !is_null($slot->appointment_id),
                        'appointment_id' => $slot->appointment_id,
                    ];
                })
            ];
            
            $start->addDay();
        }
        
        return $summary;
    }
}
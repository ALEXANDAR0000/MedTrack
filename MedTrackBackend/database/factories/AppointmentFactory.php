<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Appointment;
use App\Models\User;
use App\Models\DoctorAvailabilityRule;
use App\Models\AppointmentTimeSlot;
use App\Services\TimeSlotService;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get a random doctor and patient
        $doctor = User::where('role', 'doctor')->inRandomOrder()->first() ?? User::factory()->create(['role' => 'doctor']);
        $patient = User::where('role', 'patient')->inRandomOrder()->first() ?? User::factory()->create(['role' => 'patient']);
        
        // Create some basic availability for the doctor if none exists
        $this->ensureDoctorHasAvailability($doctor->id);
        
        // Generate a future date
        $date = Carbon::now()->addDays(fake()->numberBetween(1, 30));
        
        // Try to get an available time slot for this doctor and date
        $timeSlotService = new TimeSlotService();
        $availableSlots = $timeSlotService->getAvailableSlots($doctor->id, $date);
        
        if ($availableSlots->isEmpty()) {
            // Fallback to basic time slot if no availability rules exist
            $startTime = fake()->randomElement(['09:00', '10:00', '11:00', '14:00', '15:00']);
            $endTime = Carbon::parse($startTime)->addHour()->format('H:i');
        } else {
            // Use an actual available slot
            $slot = $availableSlots->random();
            $startTime = $slot->start_time;
            $endTime = $slot->end_time;
            $date = $slot->date;
        }
        
        return [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'in_progress', 'completed']),
        ];
    }
    
    /**
     * Ensure doctor has basic availability rules for testing
     */
    private function ensureDoctorHasAvailability($doctorId)
    {
        $hasAvailability = DoctorAvailabilityRule::where('doctor_id', $doctorId)->exists();
        
        if (!$hasAvailability) {
            // Create basic Monday-Friday 9-17 availability
            foreach ([1, 2, 3, 4, 5] as $dayOfWeek) {
                DoctorAvailabilityRule::create([
                    'doctor_id' => $doctorId,
                    'rule_type' => 'template',
                    'day_of_week' => $dayOfWeek,
                    'start_time' => '09:00',
                    'end_time' => '17:00',
                    'is_available' => true,
                    'slot_duration' => 60,
                ]);
            }
        }
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Appointment;
use App\Models\User;
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
        $availableSlots = [
            '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
        ];

        $date = Carbon::now()->addDays(fake()->numberBetween(1, 30))->format('Y-m-d');
        $time = fake()->randomElement($availableSlots);
        
        return [
            'patient_id' => User::where('role', 'patient')->inRandomOrder()->first()->id ?? User::factory()->create(['role' => 'patient'])->id,
            'doctor_id' => User::where('role', 'doctor')->inRandomOrder()->first()->id ?? User::factory()->create(['role' => 'doctor'])->id,
            'date' => "$date $time:00",
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'in_progress', 'completed']),
        ];
    }
}

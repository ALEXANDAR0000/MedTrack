<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Prescription;
use App\Models\Appointment;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Prescription>
 */
class PrescriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'appointment_id' => Appointment::inRandomOrder()->first()->id ?? Appointment::factory()->create()->id,
            'doctor_id' => User::where('role', 'doctor')->inRandomOrder()->first()->id ?? User::factory()->create(['role' => 'doctor'])->id,
            'details' => fake()->sentence(12),
        ];
    }
}

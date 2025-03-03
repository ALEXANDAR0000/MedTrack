<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roles = ['patient', 'doctor'];
        $role = fake()->randomElement($roles);
        $doctorTypes = ['cardiologist', 'neurologist', 'orthopedic', 'dermatologist', 'pediatrician', 'surgeon', 'ophthalmologist', 'gastroenterologist', 'pulmonologist', 'psychiatrist'];

        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'role' => $role,
            'gender' => $role === 'patient' ? fake()->randomElement(['male', 'female']) : null,
            'date_of_birth' => $role === 'patient' ? fake()->date() : null,
            'city' => $role === 'patient' ? fake()->city() : null,
            'address' => $role === 'patient' ? fake()->address() : null,
            'doctor_type' => $role === 'doctor' ? fake()->randomElement($doctorTypes) : null,
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }
}
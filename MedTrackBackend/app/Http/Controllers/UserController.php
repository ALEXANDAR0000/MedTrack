<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Show all doctors
     */
    public function getAllDoctors()
    {
        $doctors = User::where('role', 'doctor')->get();
        return response()->json($doctors);
    }
    /**
     * Show all patients
     */
    public function getAllPatients()
    {
        $patients = User::where('role', 'patient')->get();
        return response()->json($patients);
    }
    /**
    * Show one doctor by ID
    */
    public function getDoctor($id)
    {
    $doctor = User::where('role', 'doctor')->findOrFail($id);
    return response()->json($doctor);
    }

    /**
    * Show one patient by ID
    */
    public function getPatient($id)
    {
    $patient = User::where('role', 'patient')->findOrFail($id);
    return response()->json($patient);
    }

    /**
     * Create new doctor
     */
    public function createDoctor(Request $request)
    {
        $fields = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'doctor_type' => 'required|in:cardiologist,neurologist,orthopedic,dermatologist,pediatrician,surgeon,ophthalmologist,gastroenterologist,pulmonologist,psychiatrist',
        ]);

        $doctor = User::create([
            'first_name' => $fields['first_name'],
            'last_name' => $fields['last_name'],
            'role' => 'doctor',
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
            'doctor_type' => $fields['doctor_type'],
        ]);

        return response()->json(['message' => 'Doctor created successfully', 'doctor' => $doctor], 201);
    }
    /**
     * Create new patient
     */
    public function createPatient(Request $request)
    {
        $fields = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'gender' => 'required|in:male,female',
            'date_of_birth' => 'required|date',
            'city' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        $patient = User::create([
            'first_name' => $fields['first_name'],
            'last_name' => $fields['last_name'],
            'role' => 'patient',
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
            'gender' => $fields['gender'],
            'date_of_birth' => $fields['date_of_birth'],
            'city' => $fields['city'],
            'address' => $fields['address'],
        ]);

        return response()->json(['message' => 'Patient created successfully', 'patient' => $patient], 201);
    }
     /**
     * Update doctor
     */
    public function updateDoctor(Request $request, $id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);

        $fields = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'doctor_type' => 'sometimes|in:cardiologist,neurologist,orthopedic,dermatologist,pediatrician,surgeon,ophthalmologist,gastroenterologist,pulmonologist,psychiatrist',
        ]);

        $doctor->update($fields);
        return response()->json(['message' => 'Doctor updated successfully', 'doctor' => $doctor]);
    }
    /**
     * Update patient
     */
    public function updatePatient(Request $request, $id)
    {
        $patient = User::where('role', 'patient')->findOrFail($id);

        $fields = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'gender' => 'sometimes|in:male,female',
            'date_of_birth' => 'sometimes|date',
            'city' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
        ]);

        $patient->update($fields);
        return response()->json(['message' => 'Patient updated successfully', 'patient' => $patient]);
    }
    /**
     * Delete doctor/patient
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
    /**
     * Update patient profile
     */
    public function updatePatientProfile(Request $request)
    {
        $user = Auth::user();

        $fields = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'gender' => 'sometimes|in:male,female',
            'date_of_birth' => 'sometimes|date',
            'city' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:6',
        ]);

        if (isset($fields['password'])) {
            $fields['password'] = Hash::make($fields['password']);
        }

        $user->update($fields);

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    }

    /**
     * Delete patient profile
     */
    public function deleteMyAccount()
    {
        $user = Auth::user();
        $user->delete();

        return response()->json(['message' => 'Your account has been deleted successfully.']);
    }
}
   
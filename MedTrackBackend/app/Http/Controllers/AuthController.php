<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registration (only for patients)
     */
    public function register(Request $request)
    {
        $fields = $request->validate([
            'first_name'    => 'required|string|max:255',
            'last_name'     => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:6',
            'gender'        => 'required|in:male,female',
            'date_of_birth' => 'required|date',
            'city'          => 'required|string|max:255',
            'address'       => 'required|string|max:255',
        ]);

        // Role "patient" hardcode
        $fields['role'] = 'patient';

        $user = User::create([
            'first_name'    => $fields['first_name'],
            'last_name'     => $fields['last_name'],
            'role'          => 'patient',
            'email'         => $fields['email'],
            'password'      => Hash::make($fields['password']),
            'gender'        => $fields['gender'],
            'date_of_birth' => $fields['date_of_birth'],
            'city'          => $fields['city'],
            'address'       => $fields['address'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Patient registered successfully.',
            'user'    => $user,
            'token'   => $token
        ], 201);
    }

    /**
     * Login (admin, doktdoctoror, patient)
     */
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json(['errors' => ['email'=>['Invalid credentials.']]], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $user,
            'token'   => $token
        ], 200);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logout successful.'], 200);
    }
}

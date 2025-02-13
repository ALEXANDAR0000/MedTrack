<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(User::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'role'       => 'required|in:admin,doctor,patient',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:6',
        ]);
        // patient validation
        if ($request->role === 'patient') {
            $request->validate([
                'gender'        => 'required|in:male,female',
                'date_of_birth' => 'required|date',
                'city'          => 'required|string|max:255',
                'address'       => 'required|string|max:255',
            ]);
        }
        //doctor validation
        if ($request->role === 'doctor') {
            $request->validate([
                'doctor_type' => 'required|in:kardiolog,neurolog,ortoped,dermatolog,pedijatar,hirurg,oftalmolog,gastroenterolog,pulmolog,psihijatar',
            ]);
        }
        $user = User::create([
            'first_name'    => $fields['first_name'],
            'last_name'     => $fields['last_name'],
            'role'          => $fields['role'],
            'email'         => $fields['email'],
            'password'      => Hash::make($fields['password']),
            'gender'        => $request->gender ?? null,
            'date_of_birth' => $request->date_of_birth ?? null,
            'city'          => $request->city ?? null,
            'address'       => $request->address ?? null,
            'doctor_type'   => $request->doctor_type ?? null,
        ]);

        return response()->json($user, 201);
    }
    

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $fields = $request->validate([
            'first_name' => 'string|max:255',
            'last_name'  => 'string|max:255',
            'email'      => 'email|unique:users,email,' . $user->id,
            'password'   => 'nullable|string|min:6',
        ]);
        if ($user->role === 'patient') {
            $request->validate([
                'gender'        => 'in:male,female',
                'date_of_birth' => 'date',
                'city'          => 'string|max:255',
                'address'       => 'string|max:255',
            ]);
        }
        if ($user->role === 'doctor') {
            $request->validate([
                'doctor_type' => 'in:kardiolog,neurolog,ortoped,dermatolog,pedijatar,hirurg,oftalmolog,gastroenterolog,pulmolog,psihijatar',
            ]);
        }
        $user->update($request->only([
            'first_name', 'last_name', 'email', 'gender',
            'date_of_birth', 'city', 'address', 'doctor_type'
        ]));

        // Ako je nova lozinka prosleđena, ažuriraj je
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        return response()->json($user);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}

<?php

use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\PrescriptionController;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//Public api routes for login and registration
Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/doctors', [UserController::class, 'getAllDoctors']);
    Route::get('/admin/patients', [UserController::class, 'getAllPatients']);
    Route::get('/admin/doctors/{id}', [UserController::class, 'getDoctor']);
    Route::get('/admin/patients/{id}', [UserController::class, 'getPatient']);
    Route::post('/admin/doctors', [UserController::class, 'createDoctor']);
    Route::post('/admin/patients', [UserController::class, 'createPatient']);
    Route::put('/admin/doctors/{id}', [UserController::class, 'updateDoctor']);
    Route::put('/admin/patients/{id}', [UserController::class, 'updatePatient']);
    Route::delete('/admin/users/{id}', [UserController::class, 'deleteUser']);
});


//Patient routes
Route::middleware(['auth:sanctum', 'role:patient'])->group(function () {
    Route::post('/appointments', [AppointmentController::class, 'scheduleAppointment']);
    Route::get('/appointments', [AppointmentController::class, 'getMyAppointments']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'cancelAppointment']);
    Route::get('/appointments/available/{doctor_id}/{date}', [AppointmentController::class, 'getAvailableAppointments']);
    Route::get('/prescriptions/{appointment_id}', [PrescriptionController::class, 'getPrescription']);
    Route::put('/profile', [UserController::class, 'updatePatientProfile']);
    Route::delete('/profile/delete', [UserController::class, 'deleteMyAccount']);
    Route::get('/doctors', [UserController::class, 'getAllDoctors']);
});

//Doctor routes
Route::middleware(['auth:sanctum', 'role:doctor'])->group(function () {
    Route::get('/doctor/appointments', [AppointmentController::class, 'getDoctorAppointments']);
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateAppointmentStatus']);
    Route::post('/appointments/{id}/start', [AppointmentController::class, 'startAppointment']);
    Route::post('/appointments/{id}/finish', [AppointmentController::class, 'finishAppointment']);
    Route::post('/appointments/{id}/noshow', [AppointmentController::class, 'markAsNoShow']);
    Route::get('/patients/{id}/medical-records', [MedicalRecordController::class, 'getPatientMedicalRecord']);
    Route::post('/patients/{id}/medical-records', [MedicalRecordController::class, 'addMedicalRecord']);
    Route::delete('/medical-records/{id}', [MedicalRecordController::class, 'deleteMedicalRecord']);
    Route::post('/patients/{id}/prescriptions', [PrescriptionController::class, 'addPrescription']);
    Route::delete('/prescriptions/{id}', [PrescriptionController::class, 'deletePrescription']);
});



//routes for CRUD operations
// Route::apiResource('users', UserController::class);
// Route::apiResource('appointments', AppointmentController::class);
// Route::apiResource('medical-records', MedicalRecordController::class);
// Route::apiResource('prescriptions', PrescriptionController::class);


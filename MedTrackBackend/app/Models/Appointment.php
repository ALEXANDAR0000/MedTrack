<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    /** @use HasFactory<\Database\Factories\AppointmentFactory> */
    use HasFactory;

 /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'date',
        'start_time',
        'end_time',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'created_at' => 'datetime',
            'updated_at'  => 'datetime',
        ];
    }
     /**
      * Relationship: Each appointment belongs to a single patient.
      */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

     /**
      * Relationship: Each appointment belongs to a single doctor.
      */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Relationship: Each appointment may have a time slot
     */
    public function timeSlot()
    {
        return $this->hasOne(AppointmentTimeSlot::class);
    }
}
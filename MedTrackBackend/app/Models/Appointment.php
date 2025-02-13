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
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
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
}
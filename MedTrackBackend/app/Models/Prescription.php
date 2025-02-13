<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    /** @use HasFactory<\Database\Factories\PrescriptionFactory> */
    use HasFactory;
     /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'appointment_id',
        'doctor_id',
        'details',
    ];
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
    /**
     * Relationship: Each perscription belongs to a single appointment.
     */
        public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
     /**
     * Relationship: Each perscription belongs to a single doctor.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}

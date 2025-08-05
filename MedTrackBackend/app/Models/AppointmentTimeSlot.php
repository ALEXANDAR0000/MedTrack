<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AppointmentTimeSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'date',
        'start_time',
        'end_time',
        'is_available',
        'appointment_id',
        'reserved_until',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_available' => 'boolean',
            'reserved_until' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Relationship: Each time slot belongs to a doctor
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Relationship: Each time slot may belong to an appointment
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Scope for available slots
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
                    ->whereNull('appointment_id')
                    ->where(function($q) {
                        $q->whereNull('reserved_until')
                          ->orWhere('reserved_until', '<', Carbon::now());
                    });
    }

    /**
     * Scope for slots on a specific date
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Scope for slots for a specific doctor
     */
    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope for slots in a date range
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Reserve this slot temporarily
     */
    public function reserve($minutes = 15)
    {
        $this->update([
            'reserved_until' => Carbon::now()->addMinutes($minutes)
        ]);
    }

    /**
     * Release the reservation
     */
    public function releaseReservation()
    {
        $this->update([
            'reserved_until' => null
        ]);
    }

    /**
     * Book this slot for an appointment
     */
    public function bookForAppointment($appointmentId)
    {
        $this->update([
            'appointment_id' => $appointmentId,
            'is_available' => false,
            'reserved_until' => null
        ]);
    }

    /**
     * Release this slot (make it available again)
     */
    public function release()
    {
        $this->update([
            'appointment_id' => null,
            'is_available' => true,
            'reserved_until' => null
        ]);
    }

    /**
     * Check if slot is currently reserved
     */
    public function isReserved()
    {
        return $this->reserved_until && $this->reserved_until > Carbon::now();
    }

    /**
     * Clean up expired reservations
     */
    public static function cleanupExpiredReservations()
    {
        self::where('reserved_until', '<', Carbon::now())
            ->update(['reserved_until' => null]);
    }
}

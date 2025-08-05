<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorAvailabilityRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'rule_type',
        'day_of_week',
        'specific_date',
        'start_time',
        'end_time',
        'is_available',
        'slot_duration',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'specific_date' => 'date',
            'is_available' => 'boolean',
            'slot_duration' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Relationship: Each availability rule belongs to a doctor
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Scope for template rules (weekly recurring)
     */
    public function scopeTemplates($query)
    {
        return $query->where('rule_type', 'template');
    }

    /**
     * Scope for exception rules (specific dates)
     */
    public function scopeExceptions($query)
    {
        return $query->where('rule_type', 'exception');
    }

    /**
     * Scope for available time slots
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope for unavailable time slots (vacation, sick days, etc.)
     */
    public function scopeUnavailable($query)
    {
        return $query->where('is_available', false);
    }

    /**
     * Get rules for a specific doctor and day of week
     */
    public function scopeForDoctorAndDay($query, $doctorId, $dayOfWeek)
    {
        return $query->where('doctor_id', $doctorId)
                    ->where('rule_type', 'template')
                    ->where('day_of_week', $dayOfWeek);
    }

    /**
     * Get exception rules for a specific doctor and date
     */
    public function scopeForDoctorAndDate($query, $doctorId, $date)
    {
        return $query->where('doctor_id', $doctorId)
                    ->where('rule_type', 'exception')
                    ->whereDate('specific_date', $date);
    }
}

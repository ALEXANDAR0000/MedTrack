<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    /** @use HasFactory<\Database\Factories\MedicalRecordFactory> */
    use HasFactory;
     /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'patient_id',
        'notes',
    ];
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
    /**
     * Relationship: Each medical record belongs to a single patient.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointment_time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_available')->default(true);
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('set null');
            $table->timestamp('reserved_until')->nullable(); 
            $table->timestamps();
            
            $table->index(['doctor_id', 'date']);
            $table->index(['doctor_id', 'date', 'is_available']);
            $table->index(['appointment_id']);
            $table->index(['reserved_until']);
            
            $table->unique(['doctor_id', 'date', 'start_time'], 'unique_doctor_slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_time_slots');
    }
};

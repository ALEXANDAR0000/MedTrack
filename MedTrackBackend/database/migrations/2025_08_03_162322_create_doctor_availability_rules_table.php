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
        Schema::create('doctor_availability_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->enum('rule_type', ['template', 'exception']);
            
            // For template rules (recurring weekly)
            $table->tinyInteger('day_of_week')->nullable(); // 0=Sunday, 6=Saturday
            
            // For exception rules (specific dates)
            $table->date('specific_date')->nullable();
            
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_available')->default(true);
            $table->integer('slot_duration')->default(60); // in minutes
            
            $table->string('reason')->nullable();
            
            $table->timestamps();
            
            $table->index(['doctor_id', 'rule_type']);
            $table->index(['doctor_id', 'day_of_week']);
            $table->index(['doctor_id', 'specific_date']);
            
            $table->unique(['doctor_id', 'rule_type', 'day_of_week', 'start_time'], 'unique_template_rule');
            $table->unique(['doctor_id', 'specific_date', 'start_time'], 'unique_exception_rule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_availability_rules');
    }
};

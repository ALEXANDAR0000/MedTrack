<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prescription;

class PrescriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Prescription::factory(20)->create();
    }
}

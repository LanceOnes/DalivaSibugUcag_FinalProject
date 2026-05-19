<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Plain password — User model casts password as 'hashed'
        User::updateOrCreate(
            ['email' => 'admin@bellylicious.ph'],
            [
                'name' => 'BELLYlicious Admin',
                'phone' => '09171234567',
                'password' => 'password123',
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Juan Dela Cruz',
                'phone' => '09189876543',
                'password' => 'password123',
                'role' => 'customer',
                'address' => 'St. Ignatius Heights, Lawaan, Roxas City',
            ]
        );
    }
}

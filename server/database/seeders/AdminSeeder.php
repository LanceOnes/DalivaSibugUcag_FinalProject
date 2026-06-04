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
    }
}

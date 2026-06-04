<?php

namespace App\Http\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

trait ResolvesSanctumUser
{
    protected function sanctumUser(Request $request): ?User
    {
        if ($request->user()) {
            return $request->user();
        }

        $token = $request->bearerToken();
        if (! $token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);

        return $accessToken?->tokenable;
    }
}

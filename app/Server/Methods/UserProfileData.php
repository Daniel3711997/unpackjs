<?php

declare(strict_types=1);

namespace Unpack\Server\Methods;

class UserProfileData {
    public static function run(): array {
        return [
            "success" => true,
            "data" => [
                "id" => 1234,
            ]
        ];
    }
}

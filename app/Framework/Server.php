<?php

declare(strict_types=1);

namespace Unpack\Framework;

class Server {
    public static function getUserProfileData(): array {
        return [
            "success" => true,
            "data" => [
                "id" => 1234,
            ]
        ];
    }
}

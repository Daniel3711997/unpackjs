<?php

declare(strict_types=1);

namespace Unpack\Server;

use Unpack\Server\Methods\UserProfileData;

class ServerClient {
    public static function getUserProfileData(): array {
        return UserProfileData::run();
    }
}

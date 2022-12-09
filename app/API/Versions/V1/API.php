<?php

declare(strict_types=1);

namespace Unpack\API\Versions\V1;

use Unpack\API\Response;

class API extends Response {
    public string $version = 'v1';
    public string $route = 'profile';
    public string $namespace = 'unpack';
}

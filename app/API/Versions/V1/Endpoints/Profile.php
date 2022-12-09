<?php

declare(strict_types=1);

namespace Unpack\API\Versions\V1\Endpoints;

use WP_REST_Server;
use WP_REST_Response;
use Unpack\API\Versions\V1\API;
use Unpack\Interfaces\API as APIInterface;

class Profile extends API implements APIInterface {
    public function register(): void {
        register_rest_route("$this->namespace/$this->version", "/$this->route", [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'getProfile'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function getProfile(): WP_REST_Response {
        return $this->createResponse([
            'id' => 1234,
            'name' => 'John Doe',
        ]);
    }
}

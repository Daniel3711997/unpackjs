<?php

declare(strict_types=1);

namespace Unpack\API;

use WP_Error;
use WP_REST_Response;

class Response {
    /**
     * @param array|WP_Error $data
     * @param int $status
     * @param array $errors
     * @param array $headers
     *
     * @return WP_REST_Response
     */
    public function createResponse(
        $data = [],
        int $status = 200,
        array $errors = [],
        array $headers = []
    ): WP_REST_Response {
        $response = ['success' => true, 'status' => $status, 'data' => $data, 'errors' => $errors];

        if ($data instanceof WP_Error) {
            $response['errors'] = array_merge($response['errors'], $data->get_error_messages());
        }

        if (!empty($response['errors'])) {
            $response['data'] = null;
            $response['success'] = false;
            $response['status'] = 200 === $response['status'] ? 500 : $response['status'];
        }

        /**
         * https://developer.wordpress.org/reference/classes/wp_rest_response/
         */
        return new WP_REST_Response($response, $response['status'], array_merge($headers, [
            'Cache-Control' => 'no-cache, no-store, max-age=0, must-revalidate',
        ]));
    }
}

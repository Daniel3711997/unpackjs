<?php

/** @noinspection PhpUnusedAliasInspection */

declare(strict_types=1);

namespace Unpack\Ajax;

use Unpack\Interfaces\Ajax;
use Unpack\Annotations\AjaxRoute;

/**
 * @AjaxRoute(name="getProfile", method="getProfileAjax", availability=1)
 */
class Profile implements Ajax {
    /**
     * @used
     */
    public static function getProfileAjax(): array {
        return [
            'success' => true,
            'data' => [
                'id' => 1234,
                'name' => 'John Doe',
            ]
        ];
    }
}

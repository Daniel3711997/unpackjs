<?php

declare(strict_types=1);

namespace Unpack\Forms;

use Unpack\Interfaces\Form;
use Unpack\Annotations\FormRoute;

/**
 * @FormRoute(name="getProfile", method="getProfileForm", availability=1)
 */
class Profile implements Form {
    public static function getProfileForm(): void {
        wp_die(
            json_encode([
                'success' => true,
                'data' => [
                    'id' => 1234,
                    'name' => 'John Doe',
                ]
            ])
        );
    }
}

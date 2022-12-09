<?php

declare(strict_types=1);

namespace Unpack\WP;

function wrapFormHandler(string $action, array $params = [], array $customFormParams = []): array {
    $customInputs = [];

    if ($customFormParams) {
        foreach ($customFormParams as $name => $value) {
            $customInputs[] = '<input type="hidden" name="' . $name . '" value="' . $value . '" />';
        }
    }

    return array_merge($params, [
        'action_link' => admin_url('admin-post.php'),
        'form_handler' =>
            wp_nonce_field(
                $action,
                'security',
                true,
                false
            ) . '<input type="hidden" name="action" value="' . $action . '"/>' . implode('', $customInputs)
    ]);
}

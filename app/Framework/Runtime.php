<?php

declare(strict_types=1);

namespace Unpack\Framework;

use function Unpack\getPluginURI;

class Runtime {
    public static function getRuntimeConfig(): array {
        global $ajaxInstance, $registeredVars, $formsNonces;

        $queryVars = [];
        $ajaxNonces = [];
        $actions = $ajaxInstance->getActions();

        foreach ($registeredVars as $var) {
            $queryVars[$var] = get_query_var($var, null);
        }

        foreach ($actions as $action => $options) {
            if (isset($options['controller'], $options['controllerMethod'], $options['availability']) && 1 === $options['availability'] && method_exists(
                $options['controller'],
                $options['controllerMethod']
            )) {
                $ajaxNonces[$action] = wp_create_nonce("ajax-$action");
            }
        }

        return [
            'vars' => (object) $queryVars,
            'pluginURI' => getPluginURI(),
            'forms' => [
                'nonces' => (object) $formsNonces,
                'url' => admin_url('admin-post.php'),
            ],
            'ajax' => [
                'nonces' => (object) $ajaxNonces,
                'url' => admin_url('admin-ajax.php'),
            ],
            'rest' => [
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
            ],
        ];
    }
}

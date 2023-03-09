<?php

namespace Unpack\Framework;

use Unpack\WP\{
    Ajax,
    Forms,
    REST,
    Actions,
    Filters,
};

if (!defined('ABSPATH')) {
    exit;
}

$formsNonces = [];
$registeredVars = [];

$ajaxInstance = new Ajax();
$restInstance = new REST();
$formsInstance = new Forms();
$actionsInstance = new Actions();
$filtersInstance = new Filters();

if (!defined('WP_CLI')) {
    add_action('init', function () {
        global $formsNonces, $formsInstance;

        foreach ($formsInstance->getActions() as $action => $options) {
            if (isset($options['controller'], $options['controllerMethod'], $options['availability']) && 1 === $options['availability'] && method_exists(
                    $options['controller'],
                    $options['controllerMethod']
                )) {
                $formsNonces[$action] = wp_create_nonce("forms-$action");
            }
        }
    });
}

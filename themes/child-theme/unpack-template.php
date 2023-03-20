<?php

if (!defined('ABSPATH')) {
    exit;
}

use Unpack\Blade\Containers\HelloWorld;

/* Template Name: Unpack Template */

HelloWorld::render([
    'includeHeader' => true,
    'includeFooter' => true,
]);

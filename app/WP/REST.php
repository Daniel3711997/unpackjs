<?php

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;

use function Unpack\{
    readDirectory,
    getPluginDirectory
};

// https://developer.wordpress.org/reference/classes/wp_rest_controller/
// https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/

class REST {
    private array $endpoints = [];

    public function __construct() {
        $APIDirectory = getPluginDirectory() . 'app/API/Versions';

        $directories = readDirectory($APIDirectory);

        foreach ($directories as $directory) {
            $endpointsDirectory = $APIDirectory . '/' . $directory . '/Endpoints';

            $classes = readDirectory(
                $endpointsDirectory
            );

            foreach ($classes as $class) {
                $class = Loader::findClass(
                    $endpointsDirectory . '/' . $class
                );

                if (null === $class) {
                    continue;
                }

                $reflectionClass = new ReflectionClass($class);

                $this->endpoints[] = $reflectionClass->getName();
            }
        }

        foreach ($this->endpoints as $endpoint) {
            add_action('rest_api_init', function () use ($endpoint) {
                if (class_exists($endpoint)) {
                    $endpoint = new $endpoint();

                    if (method_exists($endpoint, 'register')) {
                        $endpoint->register();
                    }
                }
            });
        }
    }
}

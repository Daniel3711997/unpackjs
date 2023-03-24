<?php

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;
use Unpack\Annotations\FormRoute;
use Doctrine\Common\Annotations\AnnotationReader;

use function Unpack\{
    readDirectory,
    getPluginDirectory
};

class Forms {
    /**
     * 1 - Register the action only for logged in users
     * 2 - Register the action only for logged out users
     * 3 - Register the action for both logged in and logged out users
     */
    private array $actions = [];

    public function getActions(): array {
        return $this->actions;
    }

    public function __construct() {
        $directory = getPluginDirectory() . 'app/Forms';

        $classes = readDirectory(
            $directory
        );

        foreach ($classes as $class) {
            $class = Loader::findClass($directory . '/' . $class);

            if (null === $class) {
                continue;
            }

            $reflectionClass = new ReflectionClass($class);

            if ('php-annotations' === UNPACK_SYSTEM && method_exists($reflectionClass, 'getAttributes')) {
                $attributes = $reflectionClass->getAttributes(
                    FormRoute::class,
                    \ReflectionAttribute::IS_INSTANCEOF
                );

                foreach ($attributes as $attribute) {
                    $attribute = $attribute->newInstance();

                    if (
                        $attribute->disabled
                        || !isset($attribute->name, $attribute->method)
                    ) {
                        continue 2;
                    }

                    $this->actions[$attribute->name] = [
                        'controllerMethod' => $attribute->method,
                        'availability' => $attribute->availability,
                        'controller' => $reflectionClass->getName(),
                    ];

                    continue 2;
                }
            }

            $reader = new AnnotationReader();
            $annotation = $reader->getClassAnnotation($reflectionClass, FormRoute::class);

            if (
                null === $annotation
                || $annotation->disabled
                || !isset($annotation->name, $annotation->method)
            ) {
                continue;
            }

            $this->actions[$annotation->name] = [
                'availability' => $annotation->availability,
                'controller' => $reflectionClass->getName(),
                'controllerMethod' => $annotation->method,
            ];
        }

        foreach ($this->actions as $action => $options) {
            if (!isset($options['availability'])) {
                continue;
            }

            if (1 === $options['availability'] || 3 === $options['availability']) {
                add_action('admin_post_' . $action, [$this, 'formWrapper']);
            }

            if (2 === $options['availability'] || 3 === $options['availability']) {
                add_action('admin_post_nopriv_' . $action, [$this, 'formWrapper']);
            }
        }
    }

    private function formWrapper(): void {
        $action = $_POST['action'] ?? null;

        if (null === $action) {
            wp_die(
                __('No action specified', 'unpack')
            );
        }

        if (!array_key_exists($action, $this->actions)) {
            wp_die(__('Action not registered', 'unpack'));
        }

        $privateAction = $this->actions[$action];

        if (!isset($privateAction['availability'], $privateAction['controller'], $privateAction['controllerMethod'])) {
            wp_send_json_error(
                __('A controller, method and availability was not found for this action', 'unpack')
            );
        }

        if (1 === $privateAction['availability']) {
            check_admin_referer("forms-{$action}", 'security');
        }

        if (!method_exists($privateAction['controller'], $privateAction['controllerMethod'])) {
            wp_die(__('A method was not found for this action', 'unpack'));
        }

        /**
         * No need to return anything because this is handled by the defined method in the controller
         */
        call_user_func([$privateAction['controller'], $privateAction['controllerMethod']]);
    }
}

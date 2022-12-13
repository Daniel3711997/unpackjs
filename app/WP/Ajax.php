<?php

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;
use Unpack\Annotations\AjaxRoute;
use Doctrine\Common\Annotations\AnnotationReader;

use function  Unpack\readDirectory;

class Ajax {
    /**
     * 1 - Register the action only for logged in users
     * 2 - Register the action only for logged out users
     * 3 - Register the action for both logged in and logged out users
     */
    private array $actions = [
    ];

    public function getActions(): array {
        return $this->actions;
    }

    /**
     * @noinspection PhpFullyQualifiedNameUsageInspection
     *
     * @throws \ReflectionException
     * @throws \Psr\Cache\InvalidArgumentException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheLogicException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverCheckException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheSimpleCacheException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverNotFoundException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheInvalidArgumentException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheInvalidConfigurationException
     */
    public function __construct() {
        $directory = UNPACK_PLUGIN_DIRECTORY . '/app/Ajax';

        $classes = readDirectory(
            $directory
        );

        foreach ($classes as $class) {
            $class = Loader::findClass($directory . '/' . $class);

            if (null === $class) {
                continue;
            }

            $reflectionClass = new ReflectionClass($class);

            if (method_exists($reflectionClass, 'getAttributes')) {
                $attributes = $reflectionClass->getAttributes(
                    AjaxRoute::class,
                    \ReflectionAttribute::IS_INSTANCEOF
                );

                foreach ($attributes as $attribute) {
                    $attribute = $attribute->newInstance();

                    $this->actions[$attribute->name] = [
                        'availability' => $attribute->availability,
                        'controllerMethod' => $attribute->method,
                        'controller' => $reflectionClass->getName(),
                    ];

                    continue 2;
                }
            }

            $reader = new AnnotationReader();
            $annotation = $reader->getClassAnnotation($reflectionClass, AjaxRoute::class);

            if (
                null === $annotation ||
                (isset($annotation->disabled) && $annotation->disabled) ||
                !isset($annotation->name, $annotation->method, $annotation->availability)) {
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
                add_action('wp_ajax_' . $action, [$this, 'ajaxWrapper']);
            }

            if (2 === $options['availability'] || 3 === $options['availability']) {
                add_action('wp_ajax_nopriv_' . $action, [$this, 'ajaxWrapper']);
            }
        }
    }

    private function ajaxWrapper(): void {
        $action = $_POST['action'] ?? null;

        if (null === $action) {
            wp_send_json_error(
                __('No action specified', 'unpack')
            );
        }

        if (!array_key_exists($action, $this->actions)) {
            wp_send_json_error(
                __('Action not registered', 'unpack')
            );
        }

        $privateAction = $this->actions[$action];

        if (!isset($privateAction['availability'], $privateAction['controller'], $privateAction['controllerMethod'])) {
            wp_send_json_error(
                __('A controller, method or availability was not found for this action', 'unpack')
            );
        }

        if (1 === $privateAction['availability']) {
            check_ajax_referer($action, 'security');
        }

        if (!method_exists($privateAction['controller'], $privateAction['controllerMethod'])) {
            wp_send_json_error(
                __('A method was not found for this action')
            );
        } else {
            $response = call_user_func([$privateAction['controller'], $privateAction['controllerMethod']]);

            call_user_func(
                true === $response['success'] ? 'wp_send_json_success' : 'wp_send_json_error',
                $response['data']
            );
        }
    }
}

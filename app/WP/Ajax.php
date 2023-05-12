<?php

/** @noinspection PhpElementIsNotAvailableInCurrentPhpVersionInspection */

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;
use ReflectionException;
use ReflectionAttribute;
use Unpack\Annotations\AjaxRoute;
use Psr\Cache\InvalidArgumentException;
use Doctrine\Common\Annotations\AnnotationReader;
use Phpfastcache\Exceptions\PhpfastcacheLogicException;
use Phpfastcache\Exceptions\PhpfastcacheDriverException;
use Phpfastcache\Exceptions\PhpfastcacheSimpleCacheException;
use Phpfastcache\Exceptions\PhpfastcacheDriverCheckException;
use Phpfastcache\Exceptions\PhpfastcacheDriverNotFoundException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidArgumentException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidConfigurationException;

use function  Unpack\{
    readDirectory,
    getPluginDirectory
};

class Ajax {
    /**
     * 1 - Register the action only for logged-in users
     * 2 - Register the action only for logged-out users
     * 3 - Register the action for both logged in and logged-out users
     */
    private array $actions = [];

    public function getActions(): array {
        return $this->actions;
    }

    /**
     * @throws ReflectionException
     * @throws InvalidArgumentException
     * @throws PhpfastcacheLogicException
     * @throws PhpfastcacheDriverException
     * @throws PhpfastcacheSimpleCacheException
     * @throws PhpfastcacheDriverCheckException
     * @throws PhpfastcacheDriverNotFoundException
     * @throws PhpfastcacheInvalidArgumentException
     * @throws PhpfastcacheInvalidConfigurationException
     */
    public function __construct() {
        $directory = getPluginDirectory() . 'app/Ajax';

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
                    AjaxRoute::class,
                    ReflectionAttribute::IS_INSTANCEOF
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
            $annotation = $reader->getClassAnnotation($reflectionClass, AjaxRoute::class);

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
                __('A controller, method and availability was not found for this action', 'unpack')
            );
        }

        if (1 === $privateAction['availability']) {
            check_ajax_referer("ajax-{$action}", 'security');
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

<?php

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;
use Unpack\Annotations\Action;
use Doctrine\Common\Annotations\AnnotationReader;

use function Unpack\readDirectory;

class Actions {
    private array $actions = [
    ];

    public function __construct() {
        $directory = UNPACK_PLUGIN_DIRECTORY . '/app/Actions';

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
                    Action::class,
                    \ReflectionAttribute::IS_INSTANCEOF
                );

                foreach ($attributes as $attribute) {
                    $attribute = $attribute->newInstance();

                    $this->actions[$attribute->name] = [
                        'admin' => $attribute->admin,
                        'priority' => $attribute->priority,
                        'controllerMethod' => $attribute->method,
                        'accepted_args' => $attribute->acceptedArgs,
                        'controller' => $reflectionClass->getName(),
                    ];

                    continue 2;
                }
            }

            $reader = new AnnotationReader();
            $annotation = $reader->getClassAnnotation($reflectionClass, Action::class);

            if (
                null === $annotation ||
                (isset($annotation->disabled) && $annotation->disabled) ||
                !isset($annotation->name, $annotation->method, $annotation->priority, $annotation->acceptedArgs, $annotation->admin)) {
                continue;
            }

            $this->actions[$annotation->name] = [
                'admin' => $annotation->admin,
                'priority' => $annotation->priority,
                'accepted_args' => $annotation->acceptedArgs,
                'controller' => $reflectionClass->getName(),
                'controllerMethod' => $annotation->method,
            ];
        }

        foreach ($this->actions as $action => $options) {
            if (isset($options['controller'], $options['controllerMethod']) && class_exists(
                    $options['controller']
                ) && method_exists(
                    $options['controller'],
                    $options['controllerMethod']
                )) {
                add_action(
                    $action,
                    $this->registerCallbackMethod($options),
                    $options['priority'] ?? 10,
                    $options['accepted_args'] ?? 0
                );
            }
        }
    }

    public function registerCallbackMethod(array $options): callable {
        return function () use ($options) {
            $args = func_get_args();

            if (is_admin() && empty($options['admin'])) {
                return $args[0] ?? null;
            }

            return call_user_func_array(
                [$options['controller'], $options['controllerMethod']],
                $args
            );
        };
    }
}

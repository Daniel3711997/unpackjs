<?php

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;
use Unpack\Annotations\Filter;
use Doctrine\Common\Annotations\AnnotationReader;

use function Unpack\{
    readDirectory,
    getPluginDirectory
};

class Filters {
    private array $filters = [
    ];

    public function __construct() {
        $directory = getPluginDirectory() . 'app/Filters';

        $classes = readDirectory($directory);

        foreach ($classes as $class) {
            $class = Loader::findClass($directory . '/' . $class);

            if (null === $class) {
                continue;
            }

            $reflectionClass = new ReflectionClass($class);

            if ('php-annotations' === UNPACK_SYSTEM && method_exists($reflectionClass, 'getAttributes')) {
                $attributes = $reflectionClass->getAttributes(
                    Filter::class,
                    \ReflectionAttribute::IS_INSTANCEOF
                );

                foreach ($attributes as $attribute) {
                    $attribute = $attribute->newInstance();

                    $this->filters[$attribute->name] = [
                        'id' => $attribute->id,
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
            $annotation = $reader->getClassAnnotation($reflectionClass, Filter::class);

            if (
                null === $annotation ||
                (isset($annotation->disabled) && $annotation->disabled) ||
                !isset($annotation->name, $annotation->method, $annotation->priority, $annotation->acceptedArgs, $annotation->admin)) {
                continue;
            }

            $this->filters[$annotation->name] = [
                'id' => $annotation->id,
                'admin' => $annotation->admin,
                'priority' => $annotation->priority,
                'controllerMethod' => $annotation->method,
                'controller' => $reflectionClass->getName(),
                'accepted_args' => $annotation->acceptedArgs,
            ];
        }

        foreach ($this->filters as $action => $options) {
            if (isset($options['controller'], $options['controllerMethod']) && class_exists(
                    $options['controller']
                ) && method_exists(
                    $options['controller'],
                    $options['controllerMethod']
                )) {
                $callback = $this->registerCallbackMethod($options);

                if (!empty($options['id'])) {
                    if (!isset($GLOBALS['removeFilter'])) {
                        $GLOBALS['removeFilter'] = [
                            // Filters
                        ];
                    }

                    $GLOBALS['removeFilter'][$options['id']] = function () use ($action, $callback, $options) {
                        return remove_filter(
                            $action,
                            $callback,
                            $options['priority'] ?? 10,
                            $options['accepted_args'] ?? 0
                        );
                    };
                }
                add_action(
                    $action,
                    $callback,
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

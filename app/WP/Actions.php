<?php

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;
use Unpack\Annotations\Action;
use Doctrine\Common\Annotations\AnnotationReader;

use function Unpack\{
    readDirectory,
    getPluginDirectory
};

class Actions {
    private array $actions = [];

    public function __construct() {
        $directory = getPluginDirectory() . 'app/Actions';

        $classes = readDirectory(
            $directory
        );

        foreach ($classes as $class) {
            $class = Loader::findClass($directory . '/' . $class);

            if (null === $class) {
                continue;
            }

            $reflectionClass = new ReflectionClass($class);

            // if ('php-annotations' === UNPACK_SYSTEM && method_exists($reflectionClass, 'getAttributes')) {
            //     $attributes = $reflectionClass->getAttributes(
            //         Action::class,
            //         \ReflectionAttribute::IS_INSTANCEOF
            //     );

            //     foreach ($attributes as $attribute) {
            //         $attribute = $attribute->newInstance();

            //         if (
            //             $attribute->disabled
            //             || !isset($attribute->name, $attribute->method)
            //         ) {
            //             continue 2;
            //         }

            //         $this->actions[$attribute->name] = [
            //             'id' => $attribute->id,
            //             'admin' => $attribute->admin,
            //             'priority' => $attribute->priority,
            //             'controllerMethod' => $attribute->method,
            //             'acceptedArgs' => $attribute->acceptedArgs,
            //             'controller' => $reflectionClass->getName(),
            //         ];

            //         continue 2;
            //     }
            // }

            $reader = new AnnotationReader();
            $annotation = $reader->getClassAnnotation($reflectionClass, Action::class);

            if (
                null === $annotation
                || $annotation->disabled
                || !isset($annotation->name, $annotation->method)
            ) {
                continue;
            }

            $this->actions[$annotation->name] = [
                'id' => $annotation->id,
                'admin' => $annotation->admin,
                'priority' => $annotation->priority,
                'controllerMethod' => $annotation->method,
                'acceptedArgs' => $annotation->acceptedArgs,
                'controller' => $reflectionClass->getName(),
            ];
        }

        foreach ($this->actions as $action => $options) {
            if (isset($options['controller'], $options['controllerMethod']) && class_exists(
                $options['controller']
            ) && method_exists(
                $options['controller'],
                $options['controllerMethod']
            )) {
                $callback = $this->registerCallbackMethod($options);

                if (!empty($options['id'])) {
                    if (!isset($GLOBALS['removeAction'])) {
                        $GLOBALS['removeAction'] = [
                            // Actions
                        ];
                    }

                    $GLOBALS['removeAction'][$options['id']] = function () use ($action, $callback, $options) {
                        return remove_action(
                            $action,
                            $callback,
                            $options['priority'],
                            $options['acceptedArgs']
                        );
                    };
                }

                add_action(
                    $action,
                    $callback,
                    $options['priority'],
                    $options['acceptedArgs']
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

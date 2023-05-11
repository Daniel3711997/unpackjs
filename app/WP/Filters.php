<?php

declare(strict_types=1);

namespace Unpack\WP;

use Phpfastcache\Exceptions\PhpfastcacheDriverCheckException;
use Phpfastcache\Exceptions\PhpfastcacheDriverException;
use Phpfastcache\Exceptions\PhpfastcacheDriverNotFoundException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidArgumentException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidConfigurationException;
use Phpfastcache\Exceptions\PhpfastcacheLogicException;
use Phpfastcache\Exceptions\PhpfastcacheSimpleCacheException;
use Psr\Cache\InvalidArgumentException;
use ReflectionAttribute;
use ReflectionClass;
use ReflectionException;
use Unpack\Annotations\Filter;
use Doctrine\Common\Annotations\AnnotationReader;

use function Unpack\{
    readDirectory,
    getPluginDirectory
};

class Filters {
    private array $filters = [];

    /**
     * @throws InvalidArgumentException
     * @throws PhpfastcacheSimpleCacheException
     * @throws PhpfastcacheDriverNotFoundException
     * @throws PhpfastcacheInvalidConfigurationException
     * @throws PhpfastcacheDriverCheckException
     * @throws ReflectionException
     * @throws PhpfastcacheLogicException
     * @throws PhpfastcacheDriverException
     * @throws PhpfastcacheInvalidArgumentException
     */
    public function __construct() {
        $directory = getPluginDirectory() . 'app/Filters';

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
                    Filter::class,
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

                    $this->filters[$attribute->name] = [
                        'id' => $attribute->id,
                        'admin' => $attribute->admin,
                        'priority' => $attribute->priority,
                        'controllerMethod' => $attribute->method,
                        'acceptedArgs' => $attribute->acceptedArgs,
                        'controller' => $reflectionClass->getName(),
                    ];

                    continue 2;
                }
            }

            $reader = new AnnotationReader();
            $annotation = $reader->getClassAnnotation($reflectionClass, Filter::class);

            if (
                null === $annotation
                || $annotation->disabled
                || !isset($annotation->name, $annotation->method)
            ) {
                continue;
            }

            $this->filters[$annotation->name] = [
                'id' => $annotation->id,
                'admin' => $annotation->admin,
                'priority' => $annotation->priority,
                'controllerMethod' => $annotation->method,
                'controller' => $reflectionClass->getName(),
                'acceptedArgs' => $annotation->acceptedArgs,
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
                            $options['priority']
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

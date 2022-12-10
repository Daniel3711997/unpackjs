<?php

declare(strict_types=1);

namespace Unpack\WP;

use ReflectionClass;
use Unpack\Annotations\Filter;
use Unpack\Attributes\Filter as FilterAttribute;
use Doctrine\Common\Annotations\AnnotationReader;

use function Unpack\readDirectory;

class Filters {
    private array $filters = [
    ];

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
        $directory = UNPACK_PLUGIN_DIRECTORY . '/app/Filters';

        $classes = readDirectory($directory);

        foreach ($classes as $class) {
            $class = Loader::findClass($directory . '/' . $class);

            if (null === $class) {
                continue;
            }

            $reflectionClass = new ReflectionClass($class);

            if (UNPACK_CAN_USE_ATTRIBUTES) {
                $attributes = $reflectionClass->getAttributes(
                    FilterAttribute::class,
                    \ReflectionAttribute::IS_INSTANCEOF
                );

                foreach ($attributes as $attribute) {
                    $attribute = $attribute->newInstance();

                    $this->filters[$attribute->name] = [
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
                'admin' => $annotation->admin,
                'priority' => $annotation->priority,
                'accepted_args' => $annotation->acceptedArgs,
                'controller' => $reflectionClass->getName(),
                'controllerMethod' => $annotation->method,
            ];
        }

        foreach ($this->filters as $action => $options) {
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

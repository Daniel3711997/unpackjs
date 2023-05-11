<?php

declare(strict_types=1);

namespace Unpack\Cache;

use Phpfastcache\Exceptions\PhpfastcacheDriverCheckException;
use Phpfastcache\Exceptions\PhpfastcacheDriverException;
use Phpfastcache\Exceptions\PhpfastcacheDriverNotFoundException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidArgumentException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidConfigurationException;
use Phpfastcache\Exceptions\PhpfastcacheLogicException;
use Phpfastcache\Helper\Psr16Adapter;
use Phpfastcache\Config\ConfigurationOption;
use ReflectionException;

use function Unpack\getPluginDirectory;

class Engine {
    public static ?Psr16Adapter $instance = null;

    /**
     * @throws PhpfastcacheDriverNotFoundException
     * @throws PhpfastcacheInvalidConfigurationException
     * @throws PhpfastcacheDriverCheckException
     * @throws ReflectionException
     * @throws PhpfastcacheLogicException
     * @throws PhpfastcacheDriverException
     * @throws PhpfastcacheInvalidArgumentException
     */
    public static function getInstance(): Psr16Adapter {
        if (null === self::$instance) {
            self::$instance = new Psr16Adapter(
                'Files',
                new ConfigurationOption([
                    'defaultTtl' => 3600,
                    'path' => getPluginDirectory() . 'cache/unpack',
                ])
            );
        }

        return self::$instance;
    }
}

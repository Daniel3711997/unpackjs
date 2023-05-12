<?php

declare(strict_types=1);

namespace Unpack\Cache;

use ReflectionException;
use Phpfastcache\Helper\Psr16Adapter;
use Phpfastcache\Config\ConfigurationOption;
use Phpfastcache\Exceptions\PhpfastcacheLogicException;
use Phpfastcache\Exceptions\PhpfastcacheDriverException;
use Phpfastcache\Exceptions\PhpfastcacheDriverCheckException;
use Phpfastcache\Exceptions\PhpfastcacheDriverNotFoundException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidArgumentException;
use Phpfastcache\Exceptions\PhpfastcacheInvalidConfigurationException;

use function Unpack\getPluginDirectory;

class Engine {
    public static ?Psr16Adapter $instance = null;

    /**
     * @throws ReflectionException
     * @throws PhpfastcacheLogicException
     * @throws PhpfastcacheDriverException
     * @throws PhpfastcacheDriverCheckException
     * @throws PhpfastcacheDriverNotFoundException
     * @throws PhpfastcacheInvalidArgumentException
     * @throws PhpfastcacheInvalidConfigurationException
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

<?php

declare(strict_types=1);

namespace Unpack\Cache;

use Phpfastcache\Helper\Psr16Adapter;
use Phpfastcache\Config\ConfigurationOption;

class Engine {
    public static ?Psr16Adapter $instance = null;

    /**
     * @throws \ReflectionException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheLogicException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverCheckException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverNotFoundException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheInvalidArgumentException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheInvalidConfigurationException
     */
    public static function getInstance(): Psr16Adapter {
        if (null === self::$instance) {
            self::$instance = new Psr16Adapter(
                'Files',
                new ConfigurationOption([
                    'defaultTtl' => 0,
                    'path' => UNPACK_PLUGIN_DIRECTORY . '/build/cache/unpack',
                ])
            );
        }

        return self::$instance;
    }
}

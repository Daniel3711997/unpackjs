<?php

declare(strict_types=1);

namespace Unpack\Blade;

use eftec\bladeone\BladeOne;

use function Unpack\{
    isProduction,
    getPluginDirectory
};

class Engine {
    private BladeOne $bladeEngine;

    private static ?Engine $instance = null;

    public function getEngine(): BladeOne {
        return $this->bladeEngine;
    }

    public static function getInstance(): Engine {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function __construct() {
        $cacheFolder = getPluginDirectory() . 'cache/blade';
        $viewsFolder = getPluginDirectory() . 'app/Blade/Views';

        if (!is_dir($cacheFolder)) {
            mkdir(
                $cacheFolder,
                0777,
                true
            );
        }

        $this->bladeEngine = new BladeOne(
            $viewsFolder,
            $cacheFolder,
            isProduction() ? BladeOne::MODE_AUTO : BladeOne::MODE_DEBUG
        );
    }
}

<?php

declare(strict_types=1);

namespace Unpack\Blade;

use eftec\bladeone\BladeOne;

use function Unpack\isProduction;

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
        $viewsFolder = UNPACK_PLUGIN_DIRECTORY . 'app/Blade/Views';
        $cacheFolder = UNPACK_PLUGIN_DIRECTORY . 'build/cache/Blade';

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

<?php

declare(strict_types=1);

namespace Unpack\Twig;

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

class Engine {
    private Environment $twig;
    private FilesystemLoader $loader;

    private static ?Engine $instance = null;

    public function __construct() {
        $this->loader = new FilesystemLoader(__DIR__ . '/Templates');

        $this->twig = new Environment($this->loader, [
            'auto_reload' => true,
            'cache' => UNPACK_PLUGIN_DIRECTORY . '/build/cache/twig',
        ]);
    }

    public function getEngine(): Environment {
        return $this->twig;
    }

    public static function getInstance(): Engine {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }
}

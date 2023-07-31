<?php

declare(strict_types=1);

namespace Unpack\Actions;

use Unpack\Annotations\Action;
use Unpack\Blade\Containers\HelloWorld;
use Unpack\Interfaces\Action as ActionInterface;

/**
 * @Action(name="init", method="construct")
 */
class Init implements ActionInterface {
    public static function construct(): void {
        add_shortcode('RenderHelloWorld', [self::class, 'renderHelloWorld']);
    }

    public static function renderHelloWorld(): string {
        ob_start();

        HelloWorld::render();

        return ob_get_clean();
    }
}

<?php

declare(strict_types=1);

namespace Unpack\Blade\Containers;

use Unpack\Interfaces\{
    Renderer,
    RendererArguments
};
use Unpack\Blade\Engine;

use function Unpack\WP\wrapFormHandler;

class HelloWorld implements Renderer, RendererArguments {
    public static function getArguments(array $params = []): array {
        return wrapFormHandler('helloWorld', [
            'HelloWorldVersion' => '1.0.0-alpha + 12',
        ]);
    }

    public static function render(array $params = []): void {
        if (isset($params['includeHeader'])) {
            get_header(
                is_string($params['includeHeader']) ? $params['includeHeader'] : null
            );
        }

        try {
            echo Engine::getInstance()
                ->getEngine()
                ->run('HelloWorld.Example', array_merge($params, self::getArguments($params)));
        } catch (\Exception  $e) {
            wp_die(
                $e->getMessage(),
                'Unpack App Error',
                ['response' => 500, 'back_link' => true]
            );
        }

        if (isset($params['includeFooter'])) {
            get_footer(
                is_string($params['includeFooter']) ? $params['includeFooter'] : null
            );
        }
    }
}

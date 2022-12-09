<?php

declare(strict_types=1);

namespace Unpack\Twig\Containers;

use Unpack\Twig\Engine;
use Unpack\Interfaces\{Renderer, RendererArguments};
use Twig\Error\{LoaderError, RuntimeError, SyntaxError};

use function Unpack\WP\wrapFormHandler;

class App implements Renderer, RendererArguments {
    public static function getArguments(array $params = []): array {
        return wrapFormHandler('acceptConnection', [
            'app' => true
        ]);
    }

    /**
     * @throws SyntaxError
     * @throws RuntimeError
     * @throws LoaderError
     */
    public static function render(array $params = []): void {
        echo Engine::getInstance()
            ->getEngine()
            ->render('Accept.twig', array_merge($params, self::getArguments($params)));
    }
}

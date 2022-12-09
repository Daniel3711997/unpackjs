<?php

declare(strict_types=1);

namespace Unpack\Interfaces;

interface Renderer {
    public static function render(array $params = []): void;
}

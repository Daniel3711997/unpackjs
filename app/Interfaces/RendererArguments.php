<?php

declare(strict_types=1);

namespace Unpack\Interfaces;

interface RendererArguments {
    public static function getArguments(array $params = []): array;
}

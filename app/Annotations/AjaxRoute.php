<?php

declare(strict_types=1);

namespace Unpack\Annotations;

/**
 * @Annotation
 */
final class AjaxRoute {
    public string $name;
    public string $method;
    public bool $disabled;
    public int $availability;
}

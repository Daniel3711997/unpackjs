<?php

declare(strict_types=1);

namespace Unpack\Annotations;

/**
 * @Annotation
 */
final class Action {
    public bool $admin;
    public string $name;
    public int $priority;
    public string $method;
    public bool $disabled;
    public int $acceptedArgs;
}

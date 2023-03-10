<?php

declare(strict_types=1);

namespace Unpack\Annotations;

use Attribute;

/**
 * @Annotation
 * @Target("CLASS")
 * @NamedArgumentConstructor
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class FormRoute {
    public string $name;
    public string $method;
    public bool $disabled;
    public int $availability;

    public function __construct($name, $method, $availability = 3, $disabled = false) {
        $this->name = $name;
        $this->method = $method;
        $this->disabled = $disabled;
        $this->availability = $availability;
    }
}

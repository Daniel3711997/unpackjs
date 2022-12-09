<?php

declare(strict_types=1);

namespace Unpack\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE)]
class AjaxRoute {
    public function __construct(
        public string $name,
        public string $method,
        public int $availability,
        public bool $disabled = false,
    ) {
    }
}

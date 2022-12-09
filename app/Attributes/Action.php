<?php

declare(strict_types=1);

namespace Unpack\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE)]
class Action {
    public function __construct(
        public string $name,
        public string $method,
        public int $priority,
        public int $acceptedArgs,
        public bool $admin = false,
        public bool $disabled = false,
    ) {
    }
}

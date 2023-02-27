<?php

declare(strict_types=1);

namespace Unpack\Annotations;

use Attribute;

/**
 * @Annotation
 * @Target("CLASS")
 * @NamedArgumentConstructor
 */
#[Attribute(Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE)]
final class Action {
    public ?string $id;
    public bool $admin;
    public string $name;
    public int $priority;
    public string $method;
    public bool $disabled;
    public int $acceptedArgs;

    public function __construct($name, $method, $priority, $acceptedArgs, $admin = false, $disabled = false, $id = null) {
        $this->id = $id;
        $this->name = $name;
        $this->admin = $admin;
        $this->method = $method;
        $this->priority = $priority;
        $this->disabled = $disabled;
        $this->acceptedArgs = $acceptedArgs;
    }
}

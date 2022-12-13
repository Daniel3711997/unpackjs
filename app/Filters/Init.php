<?php

/** @noinspection PhpUnusedAliasInspection */

declare(strict_types=1);

namespace Unpack\Filters;

use Unpack\Annotations\Filter;
use Unpack\Interfaces\Filter as FilterInterface;

/**
 * @Filter(name="init", method="appInit", priority=10, acceptedArgs=0, admin=true, disabled=true)
 */
class Init implements FilterInterface {
    /**
     * @used
     */
    public static function appInit(): string {
        return 'Hello World';
    }
}

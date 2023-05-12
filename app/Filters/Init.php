<?php

/** @noinspection PhpUnusedAliasInspection */

declare(strict_types=1);

namespace Unpack\Filters;

use Unpack\Annotations\Filter;
use Unpack\Interfaces\Filter as FilterInterface;

/**
 * @Filter(name="init", method="appInit", disabled=true)
 */
class Init implements FilterInterface {
    public static function appInit(): string {
        return 'Hello World';
    }
}

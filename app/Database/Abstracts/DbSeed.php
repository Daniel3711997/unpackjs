<?php

namespace Unpack\Database\Abstracts;

use Exception;

abstract class DbSeed {
    /**
     * @throws Exception
     */
    public static function runSeed() {
        throw new Exception(
            __("Method 'runSeed' must be overridden", 'unpack')
        );
    }

    /**
     * @throws Exception
     */
    public static function rollbackSeed() {
        throw new Exception(
            __("Method 'rollbackSeed' must be overridden", 'unpack')
        );
    }
}

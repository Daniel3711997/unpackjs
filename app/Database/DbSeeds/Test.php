<?php

namespace Unpack\Database\DbSeeds;

use Unpack\Database\Abstracts\DbSeed;

class Test extends DbSeed {
    public static function runSeed() {
        echo 'The test seed ran!';
    }

    public static function rollbackSeed() {
        echo 'The test seed was rolled back!';
    }
}

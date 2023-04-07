<?php

namespace Unpack\Database\DbSeeds;

use WP_CLI;
use Unpack\Database\Abstracts\DbSeed;

class Test extends DbSeed {
    public static function runSeed() {
        WP_CLI::log('The test seed ran!');
    }

    public static function rollbackSeed() {
        WP_CLI::log('The test seed was rolled back!');
    }
}

<?php

namespace Unpack\Database\Migrations;

use WP_CLI;
use Unpack\Database\Abstracts\Migration;

class Test extends Migration {
    public static function runMigration(): void {
        WP_CLI::log('The test migration ran!');
    }

    public static function rollbackMigration(): void {
        WP_CLI::log('The test migration was rolled back!');
    }
}

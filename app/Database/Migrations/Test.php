<?php

namespace Unpack\Database\Migrations;

use Unpack\Database\Abstracts\Migration;

class Test extends Migration {
    public static function runMigration() {
        echo 'The test migration ran!';
    }

    public static function rollbackMigration() {
        echo 'The test migration was rolled back!';
    }
}

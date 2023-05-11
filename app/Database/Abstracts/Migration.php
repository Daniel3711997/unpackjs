<?php

namespace Unpack\Database\Abstracts;

abstract class Migration {
    public static function runMigration(): void {
        _doing_it_wrong(
            'Migration::runMigration',
            sprintf(__("Method '%s' must be overridden", 'unpack'), __METHOD__),
            '1.0.0'
        );
    }

    public static function rollbackMigration(): void {
        _doing_it_wrong(
            'Migration::rollBackMigration',
            sprintf(__("Method '%s' must be overridden", 'unpack'), __METHOD__),
            '1.0.0'
        );
    }
}

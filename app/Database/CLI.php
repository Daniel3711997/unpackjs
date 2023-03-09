<?php

namespace Unpack\Database;

use WP_CLI;
use Unpack\Database\Migrator;

class CLI {
    public function __invoke($arguments, $associativeArguments) {
        $options = [
            'files' => $arguments,
            'rollback' => !empty($associativeArguments['rollback'])
        ];

        try {
            if (!empty($associativeArguments['seed'])) {
                return Migrator::seed($options);
            }

            if (!empty($associativeArguments['migrate'])) {
                return Migrator::migrate($options);
            }
        } catch (\Exception $e) {
            WP_CLI::error("An error has occurred: {$e->getMessage()}");
        }
    }
}

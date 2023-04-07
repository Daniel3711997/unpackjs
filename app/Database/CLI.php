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
                $i = Migrator::seed($options);

                if (0 === $i) {
                    WP_CLI::warning('No seeds ran');
                } else {
                    WP_CLI::success($i . (1 === $i ? ' seed' : ' seeds') . ' ran successfully');
                }
            }

            if (!empty($associativeArguments['migrate'])) {
                $i = Migrator::migrate($options);

                if (0 === $i) {
                    WP_CLI::warning('No migrations ran');
                } else {
                    WP_CLI::success($i . (1 === $i ? ' migration' : ' migrations') . ' ran successfully');
                }
            }
        } catch (\Exception $e) {
            WP_CLI::error("An error has occurred: {$e->getMessage()}");
        }
    }
}

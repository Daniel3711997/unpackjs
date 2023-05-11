<?php

namespace Unpack\Database;

use Exception;
use WP_CLI;

use function Unpack\getPluginDirectory;

class Migrator {
    /**
     * @throws Exception
     */
    public static function seed(
        array $options = [
            'files' => [],
            'rollback' => false
        ]
    ): int {
        return self::run(
            array_merge($options, [
                'type' => 'seed'
            ])
        );
    }

    /**
     * @throws Exception
     */
    public static function migrate(
        array $options = [
            'files' => [],
            'rollback' => false
        ]
    ): int {
        return self::run(
            array_merge($options, [
                'type' => 'migrate'
            ])
        );
    }

    /**
     * @throws Exception
     */
    public static function run(array $options = []): int {
        $i = 0;

        if (0 === count($options)) {
            throw new Exception(
                'No options were passed to the run method'
            );
        }

        $isMigration = 'migrate' === $options['type'];
        $runPath = getPluginDirectory()
            . 'app/Database' . ($isMigration ? '/Migrations' : '/DbSeeds');

        if (!file_exists($runPath)) {
            throw new Exception(
                "The '" . ($isMigration ? 'Migrations' : 'DbSeeds') . "' directory does not exist"
            );
        }

        $files = glob("{$runPath}/*.php");

        if (is_array($files)) {
            if (0 === count($files)) {
                WP_CLI::error('No files found');
            }

            foreach ($files as $file) {
                $fileName = basename($file, '.php');

                if (count($options['files']) > 0 && !in_array($fileName, $options['files'])) {
                    continue;
                }

                $fileStatus = get_option(($isMigration ? "migration" : "seed") . "_{$fileName}");
                $namespace = "Unpack\\Database\\" . ($isMigration ? 'Migrations' : 'DbSeeds') . "\\{$fileName}";
                $method = $options['rollback'] ? ($isMigration ? 'rollbackMigration' : 'rollbackSeed') : ($isMigration ? 'runMigration' : 'runSeed');

                if ($method === $fileStatus) {
                    WP_CLI::warning("Class '{$fileName}' has already been run, skipping...");
                    continue;
                }

                if (!class_exists($namespace)) {
                    throw new Exception(
                        "Class '{$namespace}' does not exist"
                    );
                }

                if (!method_exists($namespace, $method)) {
                    throw new Exception(
                        "Class '{$namespace}' does not have a '{$method}' method"
                    );
                }

                $i++;
                call_user_func([$namespace, $method]);
                update_option(($isMigration ? "migration" : "seed") . "_{$fileName}", $method);
            }
        }

        return $i;
    }
}

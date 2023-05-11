<?php

/** @noinspection PhpMissingFieldTypeInspection */

declare(strict_types=1);

namespace Unpack\Framework;

class Assets {
    private static $manifestJSON = null;
    private static string $localManifestPath = UNPACK_PLUGIN_DIRECTORY . 'build/manifest.json';

    public static function getAsset(string $asset): ?string {
        return self::getManifest()[$asset] ?? null;
    }

    public static function getManifest(): array {
        if (null !== self::$manifestJSON) {
            return self::$manifestJSON;
        }

        if (file_exists(self::$localManifestPath)) {
            self::$manifestJSON = json_decode(
                file_get_contents(self::$localManifestPath),
                true
            );

            if (null === self::$manifestJSON) {
                wp_die(
                    __(
                        'The manifest.json file is not valid JSON, try to build the project again',
                        'unpack'
                    )
                );
            }
        }

        return [];
    }
}

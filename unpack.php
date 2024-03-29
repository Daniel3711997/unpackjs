<?php

/**
 * Unpack App
 *
 * @license           MIT
 * @package           Unpack
 * @author            Daniel3711997
 * @copyright         2023 © Next Level Digital
 *
 * @wordpress-plugin
 * Plugin Name:       Unpack
 * Plugin URI:        https://gotonxtlevel.com/unpack
 * Description:       Integrates React JS with WordPress
 * Version:           1.0.3
 * Requires at least: 5.2
 * Requires PHP:      7.4
 * Author:            Daniel3711997
 * Author URI:        https://github.com/Daniel3711997
 * Text Domain:       unpack
 * Domain Path:       /languages
 * License:           MIT
 * Update URI:        https://gotonxtlevel.com/unpack/update
 * License URI:       https://github.com/Daniel3711997/unpackjs/blob/main/LICENSE.md
 */

declare(strict_types=1);

namespace Unpack;

use WP_CLI;
use Throwable;
use Dotenv\Dotenv;
use Unpack\Database\CLI;
use Unpack\Framework\App;
use Unpack\Cache\Engine as CacheEngine;

if (!defined('ABSPATH')) {
    exit;
}

if (!file_exists(__DIR__ . '/build')) {
    wp_die(
        __(
            'No build folder found, please run `npm run configure-development` or `npm run configure-production`',
            'unpack'
        )
    );
}

if (!file_exists(__DIR__ . '/vendor')) {
    wp_die(
        __(
            'No vendor folder found, please run `npm run configure-development` or `npm run configure-production`',
            'unpack'
        )
    );
}

set_error_handler(
    function (int $errorNumber, string $errorString, string $errorFile, int $errorLine) {
        if (!(error_reporting() & $errorNumber)) {
            return false;
        }

        $error = sprintf(
            '(%d) There was an error in the file %s on line %d: %s',
            $errorNumber,
            $errorFile,
            $errorLine,
            htmlspecialchars(
                $errorString
            )
        );

        error_log(
            $error
        );

        if (E_USER_ERROR === $errorNumber) {
            wp_die(
                $error
            );
        } else {
            echo $error;
        }

        return true;
    }
);

set_exception_handler(
    function (Throwable $exception) {
        $error = sprintf(
            '(%d) There was an error in the file %s on line %d: %s',
            $exception->getCode(),
            $exception->getFile(),
            $exception->getLine(),
            $exception->getMessage()
        );

        error_log(
            $error
        );

        wp_die(
            $error
        );
    }
);

define('UNPACK_SYSTEM', 'doctrine'); // or php-annotations
define('UNPACK_PLUGIN_HOME_URL', home_url());
define('UNPACK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UNPACK_PLUGIN_DIRECTORY', plugin_dir_path(__FILE__));

require __DIR__ . '/vendor/autoload.php'; // Autoload files using Composer autoload

define(
    'UNPACK_PLUGIN_ENVIRONMENT',
    !empty(App::getManifest()['production']) ? 'production' : 'development'
);

require __DIR__ . '/app/Framework/Initialize.php';

$dotenv = Dotenv::createImmutable(__DIR__);

if (file_exists(__DIR__ . '/.env')) {
    $dotenv->load();
}

function getPluginURI(): string {
    return UNPACK_PLUGIN_URL;
}

function getPluginDirectory(): string {
    return UNPACK_PLUGIN_DIRECTORY;
}

function getAssetsURI(): string {
    return getPluginURI() . 'assets';
}

function getAssetsDirectory(): string {
    return getPluginDirectory() . 'assets';
}

function isProduction(): bool {
    return 'production' === UNPACK_PLUGIN_ENVIRONMENT;
}

function isDevelopment(): bool {
    return 'development' === UNPACK_PLUGIN_ENVIRONMENT;
}

function readDirectory(string $directory): array {
    $cache = CacheEngine::getInstance();
    $cacheKey = md5('readDirectory' . '-' . $directory);

    if (isProduction() && $cache->has($cacheKey)) {
        return $cache->get($cacheKey);
    }

    if (!is_dir($directory)) {
        return [];
    }

    $files = array_diff(scandir($directory) ?: [], ['.', '..', '.DS_Store']);

    if (isProduction()) {
        $cache->set($cacheKey, $files, 0);
    }

    return $files;
}

add_shortcode(
    'framework-app',
    function ($reactJSShortCodeAttributes) {
        $attributes = shortcode_atts([
            'id' => 'root',
            'echo' => false,
            'loader' => '<div class="framework-loader"><p>Loading...</p></div>',
        ], $reactJSShortCodeAttributes);

        $noScript = '<noscript>Could not load the application the JavaScript runtime seems to be disabled</noscript>';

        /**
         * Do not escape the loader because we want to allow HTML to be passed in
         */
        $html = '<div id="' . esc_attr($attributes['id']) . '">' . $attributes['loader'] . $noScript . '</div>';

        if ($attributes['echo']) {
            echo $html;
        } else {
            return $html;
        }

        return null;
    }
);


add_action('init', [App::class, 'registerRules']);
add_action('wp_enqueue_scripts', [App::class, 'load']);
add_action('admin_enqueue_scripts', [App::class, 'load']);
add_filter('query_vars', [App::class, 'registerQueryVars']);

if (defined('WP_CLI')) {
    WP_CLI::add_command('unpack', CLI::class);
}
register_theme_directory(UNPACK_PLUGIN_DIRECTORY . 'themes');

add_filter(
    'script_loader_tag',
    function (string $url): string {
        $entrypoints = App::getManifest()['entrypoints'];

        foreach ($entrypoints as $entrypoint) {
            if (isset($entrypoint['js']) && is_array($entrypoint['js'])) {
                foreach ($entrypoint['js'] as $script) {
                    $search = ' src';
                    $replace = ' defer src';

                    if (isDevelopment()) {
                        $replace = ' defer crossorigin src';
                    }

                    if (false !== strpos($url, $script) && false === strpos($url, $replace)) {
                        return str_replace($search, $replace, $url);
                    }
                }
            }
        }

        return $url;
    }
);

add_filter('theme_root_uri', function (string $themeRootURI): string {
    if (false === strpos($themeRootURI, 'http') && false !== strpos($themeRootURI, '/themes')) {
        $themeRootURI = UNPACK_PLUGIN_URL . 'themes';
    }

    return $themeRootURI;
});

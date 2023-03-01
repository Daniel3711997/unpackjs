<?php

/**
 * Unpack App
 *
 * @package           Unpack
 * @author            Next Level Digital
 * @copyright         2022 Next Level Digital
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       Unpack
 * Plugin URI:        https://gotonxtlevel.com/unpack
 * Description:       Integrates React JS with WordPress
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.4
 * Author:            Next Level Digital
 * Author URI:        https://gotonxtlevel.com
 * Text Domain:       unpack
 * Domain Path:       /languages
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Update URI:        https://gotonxtlevel.com/unpack/update
 */

declare(strict_types=1);

namespace Unpack;

use Dotenv\Dotenv;
use Unpack\Framework\App;
use Unpack\Cache\Engine as CacheEngine;
use Doctrine\Common\Annotations\AnnotationRegistry;

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

define('UNPACK_SYSTEM', 'doctrine'); // 'doctrine' or 'php-annotations'
define('UNPACK_PLUGIN_HOME_URL', home_url());
define('UNPACK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UNPACK_PLUGIN_DIRECTORY', plugin_dir_path(__FILE__));

require __DIR__ . '/vendor/autoload.php';

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
        $cache->set($cacheKey, $files);
    }

    return $files;
}

// function isUsingOPCache(): bool {
//     if (function_exists('opcache_get_status')) {
//         $status = opcache_get_status();
//         return $status && $status['opcache_enabled'];
//     }
//
//     return false;
// }

add_shortcode(
    'framework-app',
    function ($reactJSShortCodeAttributes) {
        $attributes = shortcode_atts([
            'id' => 'root',
            'echo' => false,
            'loader' => '<div class="framework-loader"><p>Loading...</p></div>',
        ], $reactJSShortCodeAttributes);

        /**
         * Do not escape the loader because we want to allow HTML to be passed in
         */
        $html =  '<div id="' . esc_attr($attributes['id']) . '">' . $attributes['loader'] . '</div>';

        if ($attributes['echo']) {
            echo $html;
        } else {
            return $html;
        }
    }
);

// if (!isUsingOPCache()) {
//     ini_set('opcache.enable', '1');
// }
//
// ini_set('opcache.revalidate_freq', isProduction() ? '60' : '0');

add_action('init', [App::class, 'registerRules']);
add_action('wp_enqueue_scripts', [App::class, 'load']);
add_action('admin_enqueue_scripts', [App::class, 'load']);
add_filter('query_vars', [App::class, 'registerQueryVars']);

AnnotationRegistry::registerLoader('class_exists');
register_theme_directory(UNPACK_PLUGIN_DIRECTORY . 'themes');

/**
 * Prevents to return the resolved symlink path
 *
 * __FILE__
 *
 * The full path and filename of the file with symlinks resolved. If used inside an include, the name of the included file is returned
 */
add_filter('theme_root_uri', function (string $themeRootURI): string {
    if (false === strpos($themeRootURI, 'http') && false !== strpos($themeRootURI, 'unpack/themes')) {
        return UNPACK_PLUGIN_URL . 'themes';
    }

    return $themeRootURI;
});

add_filter(
    'script_loader_tag',
    function (string $url): string {
        $entrypoints = App::getManifest()['entrypoints'];

        foreach ($entrypoints as $entrypoint) {
            if (isset($entrypoint['js']) && is_array($entrypoint['js'])) {
                foreach ($entrypoint['js'] as $script) {
                    $search = ' src';
                    $replace = ' defer src';

                    if (false !== strpos($url, $script) && false === strpos($url, $replace)) {
                        return str_replace($search, $replace, $url);
                    }
                }
            }
        }

        return $url;
    }
);

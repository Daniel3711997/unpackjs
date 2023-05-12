<?php

/** @noinspection DuplicatedCode */

declare(strict_types=1);

namespace Unpack\Framework;

use Unpack\Server\ServerClient;

use function Unpack\{
    isProduction,
    isDevelopment
};

class App {
    private static array $server = [];

    private static string $routesPath = UNPACK_PLUGIN_DIRECTORY . 'src/routes.json';
    private static string $routesHashPath = UNPACK_PLUGIN_DIRECTORY . 'src/routes.hash';
    private static string $localManifestPath = UNPACK_PLUGIN_DIRECTORY . 'build/entrypoints.json';

    public static function load(): void {
        global $preloadJS, $preloadCSS, $preloadFonts;

        $preloadJS = [];
        $preloadCSS = [];
        $preloadFonts = [];
        $localizedId = null;
        $alreadyInjected = false;
        $alreadyLocalized = false;
        $routes = self::getRoutes();
        $entrypoints = self::getManifest()['entrypoints'];

        if (!is_array($entrypoints)) {
            wp_die(__('The entrypoints property is not an array', 'unpack'));
        }

        foreach ($routes as $route) {
            if (is_admin() && empty($route['admin'])) {
                continue;
            }

            $includeFramework = false;

            if (isset($route['tests']) && is_array($route['tests'])) {
                $operator = $route['operator'] ?? 'AND';

                foreach ($route['tests'] as $test) {
                    if (function_exists($test['function'])) {
                        $result = call_user_func_array(
                            $test['function'],
                            $test['arguments'] ?? []
                        );

                        if ('AND' === $operator) {
                            $includeFramework = true === $result;

                            if (false === $includeFramework) {
                                break;
                            }
                        }

                        if ('OR' === $operator && true === $result) {
                            $includeFramework = true;
                            break;
                        }
                    }
                }
            }

            if ($includeFramework) {
                if (isset($route['fonts']['used']['woff2'])) {
                    $preloadFonts = array_merge($preloadFonts, $route['fonts']['used']['woff2']);
                }

                foreach (($entrypoints[$route['entry']['name']]['css'] ?? []) as $entrypoint) {
                    $id = md5($entrypoint);

                    if (wp_script_is($id)) {
                        continue;
                    }

                    $preloadCSS[] = $entrypoint;

                    wp_enqueue_style(
                        $id,
                        isDevelopment() ? $entrypoint : UNPACK_PLUGIN_HOME_URL . $entrypoint,
                        $route['cssDependencies'] ?? [],
                        null, // isDevelopment() ? time() : null,
                        $route['cssMedia'] ?? 'all'
                    );
                }

                foreach (($entrypoints[$route['entry']['name']]['js'] ?? []) as $entrypoint) {
                    $id = md5($entrypoint);

                    if (wp_script_is($id)) {
                        continue;
                    }

                    $preloadJS[] = $entrypoint;

                    wp_enqueue_script(
                        $id,
                        isDevelopment() ? $entrypoint : UNPACK_PLUGIN_HOME_URL . $entrypoint,
                        $route['jsDependencies'] ?? [],
                        null, // isDevelopment() ? time() : null,
                        $route['jsInFooter'] ?? true
                    );

                    if (!$alreadyInjected && isProduction() && 'react' === $route['app']) {
                        $plainJavaScript = <<<JS
if ('object' === typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    for (const property in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[property] =
            'function' === typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[property] ? function () {} : [];
    }
}
JS;
                        $alreadyInjected = true;
                        wp_add_inline_script($id, $plainJavaScript, 'before');
                    }

                    if (!$alreadyLocalized) {
                        $localizedId = $id;
                        $alreadyLocalized = true;
                    }
                }

                if (isset($route['server'])) {
                    $server = $route['server'];

                    if (method_exists(ServerClient::class, $server['method'])) {
                        self::$server[$server['key']] = call_user_func([ServerClient::class, $server['method']]);
                    }
                }
            }
        }

        if ($localizedId) {
            wp_localize_script($localizedId, 'appServer', self::$server);
            wp_localize_script($localizedId, 'appRuntime', Runtime::getRuntimeConfig());
        }
    }

    public static function registerQueryVars(array $vars): array {
        $routes = self::getRoutes();

        foreach ($routes as $route) {
            global $registeredVars;

            if (is_admin() && empty($route['admin'])) {
                continue;
            }

            $includeFramework = false;

            if (isset($route['tests']) && is_array($route['tests'])) {
                $operator = $route['operator'] ?? 'AND';

                foreach ($route['tests'] as $test) {
                    if (function_exists($test['function'])) {
                        $result = call_user_func_array(
                            $test['function'],
                            $test['arguments'] ?? []
                        );

                        if ('AND' === $operator) {
                            $includeFramework = true === $result;

                            if (false === $includeFramework) {
                                break;
                            }
                        }

                        if ('OR' === $operator && true === $result) {
                            $includeFramework = true;
                            break;
                        }
                    }
                }
            }

            if ($includeFramework && isset($route['rewrites']) && is_array($route['rewrites'])) {
                foreach ($route['rewrites'] as $rewrite) {
                    if (isset($rewrite['queryVars']) && is_array($rewrite['queryVars'])) {
                        foreach ($rewrite['queryVars'] as $queryVar) {
                            $vars[] = $queryVar;
                            $registeredVars[] = $queryVar;
                        }
                    }
                }
            }
        }

        return $vars;
    }

    public static function registerRules(): void {
        $routes = self::getRoutes();

        foreach ($routes as $route) {
            if (isset($route['rewrites']) && is_array($route['rewrites'])) {
                foreach ($route['rewrites'] as $rewrite) {
                    add_rewrite_rule($rewrite['regex'], $rewrite['query'], $rewrite['after']);
                }
            }
        }

        $hash = self::getControllerHash();

        if ($hash['currentHash'] !== $hash['previousHash']) {
            flush_rewrite_rules();
            self::writeControllerHash();
        }
    }

    public static function getManifest(): array {
        if (!file_exists(self::$localManifestPath)) {
            wp_die(
                __(
                    'Local manifest file not found, perhaps you forgot to build the application ? (npm run build or npm run start)',
                    'unpack'
                )
            );
        }

        return json_decode(file_get_contents(self::$localManifestPath), true);
    }

    private static function getRoutes(): array {
        if (!file_exists(self::$routesPath)) {
            wp_die(__('Routes file not found', 'unpack'));
        }

        return json_decode(file_get_contents(self::$routesPath), true)['routes'];
    }

    private static function writeControllerHash(): void {
        file_put_contents(self::$routesHashPath, md5_file(self::$routesPath));
    }

    private static function getControllerHash(): array {
        if (!file_exists(self::$routesPath)) {
            wp_die(__('Routes file not found', 'unpack'));
        }

        return [
            'currentHash' => md5_file(self::$routesPath),
            'previousHash' => file_exists(self::$routesHashPath) ? file_get_contents(self::$routesHashPath) : null,
        ];
    }
}

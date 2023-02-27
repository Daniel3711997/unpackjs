<?php

declare(strict_types=1);

namespace Unpack\Actions;

use Unpack\Framework\App;
use Unpack\Annotations\Action;
use Unpack\Interfaces\Action as ActionInterface;

use function Unpack\{
    isProduction, getPluginDirectory, readDirectory
};

/**
 * @Action(name="wp_head", method="construct", priority=4, acceptedArgs=0, id="appPreload")
 */
class Preload implements ActionInterface {
    public static function inArray(string $search, array $array): bool {
        foreach ($array as $value) {
            return false !== strpos($search, $value);
        }

        return false;
    }

    public static function construct(): void {
        global $preloadJS, $preloadCSS, $preloadFonts;

        if (isProduction()) {
            $pluginDirectory = getPluginDirectory();
            $fontsDirectory = $pluginDirectory . 'build/assets/fonts';
            $publicPath = App::getManifest()['publicPath'] . '/assets/fonts';

            if ($preloadFonts && file_exists($fontsDirectory)) {
                foreach (
                    array_map(function ($font) use ($fontsDirectory, $preloadFonts, $publicPath) {
                        $fontInfo = pathinfo($font);

                        if ('woff2' === $fontInfo['extension'] && self::inArray($font, $preloadFonts)) {
                            return $fontsDirectory . '/' . $font;
                        }

                        return null;
                    }, readDirectory($fontsDirectory)) as $font
                ) {
                    if ($font && is_file($font)) {
                        echo '<link rel="preload" href="' . str_replace(
                                $fontsDirectory,
                                $publicPath,
                                $font
                            ) . '" as="font" type="font/woff2" crossorigin />' . PHP_EOL;
                    }
                }
            }

            foreach ($preloadCSS as $appStyle) {
                echo '<link rel="preload" href="' . $appStyle . '" as="style" />' . PHP_EOL;
            }

            foreach ($preloadJS as $appScript) {
                echo '<link rel="preload" href="' . $appScript . '" as="script" />' . PHP_EOL;
            }
        }
    }
}

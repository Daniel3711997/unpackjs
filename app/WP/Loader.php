<?php

/** @noinspection PhpFullyQualifiedNameUsageInspection */

declare(strict_types=1);

namespace Unpack\WP;

use Unpack\Cache\Engine as CacheEngine;

use function Unpack\isProduction;

class Loader {
    /**
     * https://github.com/symfony/symfony/blob/6.3/src/Symfony/Component/Routing/Loader/AnnotationFileLoader.php
     *
     * @param string $file
     *
     * @return string|null
     *
     * @throws \ReflectionException
     * @throws \InvalidArgumentException
     * @throws \Psr\Cache\InvalidArgumentException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheLogicException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverCheckException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheSimpleCacheException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheDriverNotFoundException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheInvalidArgumentException
     * @throws \Phpfastcache\Exceptions\PhpfastcacheInvalidConfigurationException
     *
     */
    public static function findClass(string $file): ?string {
        $cache = CacheEngine::getInstance();
        $cacheKey = md5('findClass' . '-' . $file);

        if (isProduction() && $cache->has($cacheKey)) {
            return $cache->get($cacheKey);
        }

        $result = self::cachedFindClass($file);

        if ($result && isProduction()) {
            $cache->set($cacheKey, $result);
        }

        return $result;
    }

    /**
     * https://github.com/symfony/symfony/blob/6.3/src/Symfony/Component/Routing/Loader/AnnotationFileLoader.php
     *
     * @param string $file
     * @return string|null
     */
    public static function cachedFindClass(string $file): ?string {
        $class = false;
        $namespace = false;
        $tokens = token_get_all(file_get_contents($file));

        if (1 === \count($tokens) && \T_INLINE_HTML === $tokens[0][0]) {
            throw new \InvalidArgumentException(
                sprintf(
                    'The file "%s" does not contain PHP code. Did you forgot to add the "<?php" start tag at the beginning of the file?',
                    $file
                )
            );
        }

        $nsTokens = [\T_NS_SEPARATOR => true, \T_STRING => true];

        if (\defined('T_NAME_QUALIFIED')) {
            $nsTokens[\T_NAME_QUALIFIED] = true;
        }

        for ($i = 0; isset($tokens[$i]); ++$i) {
            $token = $tokens[$i];

            if (!isset($token[1])) {
                continue;
            }

            if (true === $class && \T_STRING === $token[0]) {
                return $namespace . '\\' . $token[1];
            }

            if (true === $namespace && isset($nsTokens[$token[0]])) {
                $namespace = $token[1];

                while (isset($tokens[++$i][1], $nsTokens[$tokens[$i][0]])) {
                    $namespace .= $tokens[$i][1];
                }

                $token = $tokens[$i];
            }

            if (\T_CLASS === $token[0]) {
                $skipClassToken = false;

                for ($j = $i - 1; $j > 0; --$j) {
                    if (!isset($tokens[$j][1])) {
                        if ('(' === $tokens[$j] || ',' === $tokens[$j]) {
                            $skipClassToken = true;
                        }
                        break;
                    }

                    if (\T_DOUBLE_COLON === $tokens[$j][0] || \T_NEW === $tokens[$j][0]) {
                        $skipClassToken = true;
                        break;
                    } elseif (!\in_array($tokens[$j][0], [\T_WHITESPACE, \T_DOC_COMMENT, \T_COMMENT])) {
                        break;
                    }
                }

                if (!$skipClassToken) {
                    $class = true;
                }
            }

            if (\T_NAMESPACE === $token[0]) {
                $namespace = true;
            }
        }

        return null;
    }
}

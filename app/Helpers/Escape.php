<?php

namespace Unpack\Helpers;

class Escape {
    /**
     * Recursively escape an array or object
     *
     * @param iterable $data The data to escape recursively (array or object)
     *
     * @return void
     */
    public static function recursiveEscape(iterable $data) {
        foreach ($data as &$value) {
            if (is_string($value)) {
                // Escape the string value
                $value = esc_html($value);
            } elseif (is_iterable($value)) {
                // Recursively escape the value
                self::recursiveEscape((array)$value);
            }
        }

        unset($value); // Unset the reference to the value variable
    }
}

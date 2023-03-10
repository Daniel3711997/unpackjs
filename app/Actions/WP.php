<?php

declare(strict_types=1);

namespace Unpack\Actions;

use Unpack\Annotations\Action;
use Unpack\Interfaces\Action as ActionInterface;

/**
 * @Action(name="wp", method="construct")
 */
class WP implements ActionInterface {
    public static function construct(): void {
        global $removeAction;

        // echo 'Hello World!';

        $removeAction['appPreload'](); // "appPreload" is the id of the action id in the Preload class
    }
}

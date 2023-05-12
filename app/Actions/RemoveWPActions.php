<?php

/** @noinspection PhpUnusedAliasInspection */

declare(strict_types=1);

namespace Unpack\Actions;

use Unpack\Annotations\Action;
use Unpack\Interfaces\Action as ActionInterface;

/**
 * @Action(name="wp", method="construct", disabled=true)
 */
class RemoveWPActions implements ActionInterface {
    public static function construct(): void {
        global $removeAction;

        $removeAction['appPreload'](); // "appPreload" is the id of the action id in the Preload class
    }
}

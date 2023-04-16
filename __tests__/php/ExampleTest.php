<?php

declare(strict_types=1);

namespace Tests;

use PHPUnit\Framework\TestCase;

final class ExampleTest extends TestCase {
    public function testExampleOfAssert(): void {
        $stack = [];
        $this->assertSame(0, count($stack));
    }
}

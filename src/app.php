<?php

namespace DevDebugTool;

class App {
    public static function init(): void {
        ( new Debug() )->register_hooks();
    }
}

<?php

namespace DevDebugTool;

class App {
    public static function init() {
        ( new Debug() )->register_hooks();
    }
}

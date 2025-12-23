<?php

namespace DevDebugTool;

class App {
    public static function init(): void {
		    add_action( 'init', function() {
				    ( new Debug() )->register_hooks();
				    ( new Database_Ajax() )->register_hooks();
		    } );
    }
}

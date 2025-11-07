<?php
/**
 * Plugin Name: Dev Debug Tool
 * Plugin URI: https://github.com/Batsirai-muchareva/dev-debug-tool
 * Description: A developer tool that provides real-time database and editor schema viewing within the Elementor editor.
 * Version: 1.0.0
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: dev-debug-tool
 * Requires at least: 6.2
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Elementor tested up to: 3.30
 * Elementor Pro tested up to: 3.30
 */

// Prevent direct access
if ( ! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';


define( 'DEV_DEBUG_TOOL_VERSION', '1.0.0' );
define( 'DEV_DEBUG_TOOL_FILE', __FILE__);
define( 'DEV_DEBUG_TOOL_PATH', plugin_dir_path( __FILE__ ) );
define( 'DEV_DEBUG_TOOL_URL', plugin_dir_url( __FILE__ ) );

const DEBUG_ACTIVE_TRANSIENT_KEY = 'dev_debug_tool_activated';

check_elementor_is_activated();

register_activation_hook(DEV_DEBUG_TOOL_FILE, function() {
		set_transient( DEBUG_ACTIVE_TRANSIENT_KEY, true, 30);
});

register_deactivation_hook(__FILE__, function() {
    delete_transient( DEBUG_ACTIVE_TRANSIENT_KEY );
});

function check_elementor_is_activated(): void {
		if ( ! is_plugin_active('elementor/elementor.php') ) {
				deactivate_plugins( plugin_basename(DEV_DEBUG_TOOL_FILE) );
				wp_die(__('Elementor Debug Tool requires Elementor to be installed and activated.', 'dev-debug-tool') );
		}
}

\DevDebugTool\App::init();

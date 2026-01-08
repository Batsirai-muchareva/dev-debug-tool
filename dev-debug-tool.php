<?php
///**
// * Plugin Name: Dev Debug Tool
// * Plugin URI: https://github.com/Batsirai-muchareva/dev-debug-tool
// * Description: A developer tool that provides real-time database and editor schema viewing within the Elementor editor.
// * Version: 1.0.0
// * License: GPL v2 or later
// * License URI: https://www.gnu.org/licenses/gpl-2.0.html
// * Text Domain: dev-debug-tool
// * Requires at least: 6.2
// * Tested up to: 6.4
// * Requires PHP: 7.4
// * Elementor tested up to: 3.30
// * Elementor Pro tested up to: 3.30
// */
//
//// Prevent direct access
//if ( ! defined('ABSPATH')) {
//    exit;
//}
//
////require_once __DIR__ . '/vendor/autoload.php';
//require_once __DIR__ . '/src/App.php';
//require_once __DIR__ . '/src/Database_Ajax.php';
//require_once __DIR__ . '/src/Debug.php';
//
//
//define( 'DEV_DEBUG_TOOL_VERSION', '1.0.0' );
//define( 'DEV_DEBUG_TOOL_FILE', __FILE__);
//define( 'DEV_DEBUG_TOOL_PATH', plugin_dir_path( __FILE__ ) );
//define( 'DEV_DEBUG_TOOL_URL', plugin_dir_url( __FILE__ ) );
//
//const DEBUG_ACTIVE_TRANSIENT_KEY = 'dev_debug_tool_activated';
//
//check_elementor_is_activated();
//
//register_activation_hook(DEV_DEBUG_TOOL_FILE, function() {
//		set_transient( DEBUG_ACTIVE_TRANSIENT_KEY, true, 30);
//});
//
//register_deactivation_hook(__FILE__, function() {
//    delete_transient( DEBUG_ACTIVE_TRANSIENT_KEY );
//});
//
//function check_elementor_is_activated(): void {
//		if ( ! is_plugin_active('elementor/elementor.php') ) {
//				deactivate_plugins( plugin_basename(DEV_DEBUG_TOOL_FILE) );
//				wp_die(__('Elementor Debug Tool requires Elementor to be installed and activated.', 'dev-debug-tool') );
//		}
//}
//
//App::init();


/**
 * Plugin Name: Dev Debug Tool
 * Plugin URI: https://github.com/Batsirai-muchareva/dev-debug-tool
 * Description: A developer tool that provides real-time database and editor schema viewing within the Elementor editor.
 * Version: 1.0.0
 * License: GPL v2 or later
 * Text Domain: dev-debug-tool
 * Requires at least: 6.2
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if ( ! defined('ABSPATH')) {
    exit;
}

defined( 'ABSPATH' ) || exit;

define( 'DEV_DEBUG_TOOL_VERSION', '1.0.0' );
define( 'DEV_DEBUG_TOOL_FILE', __FILE__ );
define( 'DEV_DEBUG_TOOL_PATH', plugin_dir_path( __FILE__ ) );
define( 'DEV_DEBUG_TOOL_URL', plugin_dir_url( __FILE__ ) );

const DEBUG_ACTIVE_TRANSIENT_KEY = 'dev_debug_tool_activated';

/**
 * Activation check
 */
register_activation_hook( DEV_DEBUG_TOOL_FILE, function () {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		if ( ! is_plugin_active( 'elementor/elementor.php' ) ) {
				deactivate_plugins( plugin_basename( DEV_DEBUG_TOOL_FILE ) );
				wp_die(
						__( 'Dev Debug Tool requires Elementor to be installed and activated.', 'dev-debug-tool' )
				);
		}

		set_transient( DEBUG_ACTIVE_TRANSIENT_KEY, true, 30 );
} );

/**
 * Deactivation cleanup
 */
register_deactivation_hook( DEV_DEBUG_TOOL_FILE, function () {
		delete_transient( DEBUG_ACTIVE_TRANSIENT_KEY );
} );

/**
 * Load plugin after all plugins are ready
 */
add_action( 'plugins_loaded', function () {
		// Safety check in case Elementor is deactivated later
		if ( ! did_action( 'elementor/loaded' ) ) {
				return;
		}

		require_once DEV_DEBUG_TOOL_PATH . 'src/App.php';
		require_once DEV_DEBUG_TOOL_PATH . 'src/Database_Ajax.php';
		require_once DEV_DEBUG_TOOL_PATH . 'src/Debug.php';

		DevDebugTool\App::init();
} );

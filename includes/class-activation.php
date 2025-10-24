<?php
/**
 * Plugin Activation Class
 * Handles plugin activation and deactivation
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Elementor_Debug_Tool_Activation {
    
    /**
     * Plugin activation
     */
    public static function activate() {
        // Check WordPress version
        if (version_compare(get_bloginfo('version'), '5.0', '<')) {
            deactivate_plugins(plugin_basename(ELEMENTOR_DEBUG_TOOL_FILE));
            wp_die(__('Elementor Debug Tool requires WordPress 5.0 or higher.', 'elementor-debug-tool'));
        }
        
        // Check PHP version
        if (version_compare(PHP_VERSION, '7.4', '<')) {
            deactivate_plugins(plugin_basename(ELEMENTOR_DEBUG_TOOL_FILE));
            wp_die(__('Elementor Debug Tool requires PHP 7.4 or higher.', 'elementor-debug-tool'));
        }
        
        // Check if Elementor is active
        if (!is_plugin_active('elementor/elementor.php')) {
            deactivate_plugins(plugin_basename(ELEMENTOR_DEBUG_TOOL_FILE));
            wp_die(__('Elementor Debug Tool requires Elementor to be installed and activated.', 'elementor-debug-tool'));
        }
        
        // Set activation flag
        set_transient('elementor_debug_tool_activated', true, 30);
    }
    
    /**
     * Plugin deactivation
     */
    public static function deactivate() {
        // Clean up any temporary data
        delete_transient('elementor_debug_tool_activated');
    }
    
    /**
     * Plugin uninstall
     */
    public static function uninstall() {
        // Clean up any plugin data if needed
        // Note: This is only called when the plugin is deleted, not just deactivated
    }
}

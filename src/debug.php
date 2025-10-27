<?php

namespace DevDebugTool;

class Debug {
		const AJAX_DEV_DEBUG_KEY = 'dev_debug_tool_get_database_schema';
		const NONCE_DEV_DEBUG_KEY = 'dev_debug_tool_nonce';

		public function register_hooks(): void {
				add_action( 'init', [ $this, 'init' ] );
		}

		public function init(): void {
				add_action('elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
				add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
				add_action( 'elementor/editor/v2/init', [ $this, 'print_html_slot' ] );
				add_action('wp_ajax_' .self::AJAX_DEV_DEBUG_KEY , [ $this, 'get_database_schema' ]);
		}

		public function enqueue_scripts(): void {
				$config = require DEV_DEBUG_TOOL_PATH . "build/main.asset.php";

				$handle = 'dev-debug-tool';

				wp_enqueue_script(
						$handle,
						DEV_DEBUG_TOOL_URL . 'build/main.js',
						$config['dependencies'],
						DEV_DEBUG_TOOL_VERSION,
						true
				);

				wp_localize_script(
						$handle,
						'devDebugTool',
						[
								'baseUrl' => admin_url('admin-ajax.php'),
								'nonce' => wp_create_nonce( self::NONCE_DEV_DEBUG_KEY ),
								'databaseAjaxAction' => self::AJAX_DEV_DEBUG_KEY,
						]
				);
		}

		public function enqueue_styles(): void {
				wp_enqueue_style(
						'dev-debug-tool',
						DEV_DEBUG_TOOL_URL . '/build/main.css',
						[],
						DEV_DEBUG_TOOL_VERSION,
				);
		}

		public function print_html_slot(): void {
				add_action( 'wp_footer', function () {
						echo '<div id="dev-debug-slot"></div>';
				}, 100 );
		}

		public function get_database_schema(): void {
//				vd(9000);
//				check_ajax_referer( self::NONCE_DEV_DEBUG_KEY, 'nonce' );
				$nonce_check = check_ajax_referer( self::NONCE_DEV_DEBUG_KEY, 'nonce', false );

				if ( ! $nonce_check ) {
						wp_send_json_error([
								'message' => __('Invalid nonce', 'dev-debug-tool')
						], 403);
						return;
				}

				if ( ! current_user_can('edit_posts') ) {
						wp_die(__('Insufficient permissions', 'dev-debug-tool'));
				}

				$post_id = intval( $_POST['post_id'] );

				if ( ! $post_id ) {
						wp_send_json_error(__('Invalid post ID', 'dev-debug-tool'));
				}

				$elementor_data = get_post_meta( $post_id, '_elementor_data', true );

				if ( empty( $elementor_data ) ) {
						wp_send_json_success( [
								'schema' => [],
								'message' => __('No Elementor data found for this page', 'dev-debug-tool')
						] );
				}

				if ( is_string( $elementor_data ) ) {
						$elementor_data = json_decode( $elementor_data, true );
				}

				wp_send_json_success( [
						'schema' => $elementor_data,
						'post_id' => $post_id,
						'timestamp' => current_time('mysql')
				] );
		}
}

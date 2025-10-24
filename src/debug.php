<?php

namespace DevDebugTool;

class Debug {
		public function register_hooks(): void {
				add_action( 'init', [ $this, 'init' ] );
		}

		public function init(): void {
				add_action('elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
				add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
				add_action( 'elementor/editor/v2/init', [ $this, 'print_html_slot' ] );
		}

		public function enqueue_scripts(): void {
				$config = require DEV_DEBUG_TOOL_PATH . "build/main.asset.php";

				wp_enqueue_script(
						'dev-debug-tool',
						DEV_DEBUG_TOOL_URL . 'build/main.js',
						$config['dependencies'],
						DEV_DEBUG_TOOL_VERSION,
						true
				);
		}

		public function enqueue_styles(): void {
				wp_enqueue_style(
						'dev-debug-tool',
						DEV_DEBUG_TOOL_URL . '/assets/css/dev-debug.css',
						[],
						DEV_DEBUG_TOOL_VERSION,
				);
		}

		public function print_html_slot(): void {
				add_action( 'wp_footer', function () {
						echo '<div id="dev-debug-slot"></div>';
				}, 100 );
		}
}

/**
 * Adapter Types
 * 
 * Shared type definitions for all adapters.
 * These types provide the contracts that adapters must implement.
 */

// =============================================================================
// Common Types
// =============================================================================

/**
 * Cleanup/unsubscribe function returned by subscriptions
 */
export type Unsubscribe = () => void;

/**
 * Generic callback function
 */
export type Callback<T = void> = (data: T) => void;

// =============================================================================
// Error Types
// =============================================================================

/**
 * Error codes for categorizing failures
 */
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'PARSE_ERROR'
  | 'ELEMENTOR_UNAVAILABLE'
  | 'ELEMENTOR_INCOMPATIBLE'
  | 'UNKNOWN_ERROR';

/**
 * Structured error object
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  httpStatus?: number;
  details?: unknown;
  retryable: boolean;
}

/**
 * Result type - either success or failure
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

// =============================================================================
// Elementor Types
// =============================================================================

/**
 * Supported Elementor commands
 */
export type ElementorCommand =
  | 'document/elements/select'
  | 'document/elements/deselect'
  | 'document/elements/deselect-all'
  | 'document/elements/delete'
  | 'document/elements/create'
  | 'document/save/update'
  | 'document/save/default'
  | 'panel/exit'
  | 'panel/open'
  | 'panel/close';

/**
 * Elementor element model interface
 */
export interface ElementorElementModel {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  toJSON: () => Record<string, unknown>;
  on: (event: string, handler: Callback) => void;
  off: (event: string, handler: Callback) => void;
}

/**
 * Elementor element/container interface
 */
export interface ElementorElement {
  id: string;
  cid: string;
  model: ElementorElementModel;
  view?: unknown;
  parent?: ElementorElement;
  children?: ElementorElement[];
  getContainer?: () => ElementorElement;
}

/**
 * Elementor adapter interface
 */
export interface IElementorAdapter {
  onCommand(
    commands: ElementorCommand | ElementorCommand[],
    handler: Callback
  ): Unsubscribe;

  getSelectedElement(): ElementorElement | null;
  getDocumentId(): string;
  getKitId(): string;
  getVersion(): string;
  isAvailable(): boolean;
  isCompatible(): boolean;
}

// =============================================================================
// WordPress Types
// =============================================================================

/**
 * WordPress AJAX response shape
 */
export interface WPAjaxResponse<T = unknown> {
  success: boolean;
  data: T | { message: string; code?: string };
}

/**
 * WordPress adapter options
 */
export interface WordPressAdapterOptions {
  baseUrl: string;
  nonce: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  deduplicate?: boolean;
}

/**
 * WordPress adapter interface
 */
export interface IWordPressAdapter {
  fetch<T>(action: string, data?: Record<string, string>): Promise<Result<T>>;
  getNonce(): string;
  getAjaxUrl(): string;
  setNonce(nonce: string): void;
  cancelAll(): void;
}

// =============================================================================
// Settings Types
// =============================================================================

/**
 * Plugin settings passed from PHP via wp_localize_script
 */
export interface PluginSettings {
  baseUrl: string;
  nonce: string;
  databaseAjaxAction: string;
  kitId: string;
  metaKeys: {
    post: string;
    variables: string;
    globalClasses: string;
  };
}

/**
 * Extended window with plugin settings
 */
export interface ExtendedWindow extends Window {
  devDebugTool?: {
    base_url: string;
    nonce: string;
    database_ajax_action: string;
    kit_id: string;
    meta_keys: {
      post: string;
      variables: string;
      global_classes: string;
    };
  };
  elementor?: {
    config?: {
      version?: string;
      document?: {
        id?: string;
      };
    };
    selection?: {
      getElements: () => ElementorElement[];
    };
    getPreviewView?: () => {
      getContainer: () => ElementorElement | null;
    };
  };
  $e?: {
    commands: {
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      off: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create an AppError with sensible defaults
 */
export function createError(
  code: ErrorCode,
  message: string,
  options: Partial<Omit<AppError, 'code' | 'message'>> = {}
): AppError {
  const retryableCodes: ErrorCode[] = ['NETWORK_ERROR', 'HTTP_ERROR', 'SERVER_ERROR'];

  return {
    code,
    message,
    retryable: options.retryable ?? retryableCodes.includes(code),
    ...options,
  };
}

/**
 * Type guard to check if a result is successful
 */
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if a result is an error
 */
export function isError<T>(result: Result<T>): result is { success: false; error: AppError } {
  return result.success === false;
}


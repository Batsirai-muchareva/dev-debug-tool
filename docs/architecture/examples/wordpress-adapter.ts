/**
 * WordPressAdapter - WordPress AJAX abstraction
 * 
 * This adapter wraps WordPress AJAX calls to provide:
 * 1. Consistent error handling
 * 2. Type-safe responses
 * 3. Automatic nonce handling
 * 4. Retry logic for transient failures
 * 5. Request deduplication (optional)
 * 
 * @example
 * ```typescript
 * import { wordpressAdapter } from '@app/adapters/wordpress-adapter';
 * 
 * // Fetch database schema
 * const result = await wordpressAdapter.fetch<DatabaseSchema>(
 *   'dev_debug_tool_get_database_schema',
 *   { post_id: '123', meta_key: '_elementor_data' }
 * );
 * 
 * if (result.success) {
 *   console.log('Schema:', result.data);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Error codes for categorizing failures
 */
export type ErrorCode =
  | 'NETWORK_ERROR'    // Network failure (offline, timeout)
  | 'HTTP_ERROR'       // HTTP status error (4xx, 5xx)
  | 'AUTH_ERROR'       // Authentication/nonce error
  | 'VALIDATION_ERROR' // Invalid request data
  | 'SERVER_ERROR'     // Server-side error
  | 'PARSE_ERROR'      // JSON parsing error
  | 'UNKNOWN_ERROR';   // Catch-all

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

/**
 * WordPress AJAX response shape
 */
interface WPAjaxResponse<T = unknown> {
  success: boolean;
  data: T | { message: string; code?: string };
}

/**
 * Adapter options
 */
export interface WordPressAdapterOptions {
  /**
   * Base URL for AJAX requests
   */
  baseUrl: string;

  /**
   * Security nonce
   */
  nonce: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Number of retry attempts for retryable errors
   * @default 2
   */
  retries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Enable request deduplication
   * @default true
   */
  deduplicate?: boolean;
}

/**
 * WordPress adapter interface
 */
export interface WordPressAdapter {
  /**
   * Make an AJAX request
   * @param action - WordPress AJAX action name
   * @param data - Request data
   * @returns Promise resolving to Result<T>
   */
  fetch<T>(action: string, data?: Record<string, string>): Promise<Result<T>>;

  /**
   * Get the current nonce
   */
  getNonce(): string;

  /**
   * Get the AJAX URL
   */
  getAjaxUrl(): string;

  /**
   * Update the nonce (e.g., after refresh)
   */
  setNonce(nonce: string): void;

  /**
   * Cancel all pending requests
   */
  cancelAll(): void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create an AppError from various error sources
 */
function createError(
  code: ErrorCode,
  message: string,
  options: Partial<Omit<AppError, 'code' | 'message'>> = {}
): AppError {
  const retryableByDefault: ErrorCode[] = ['NETWORK_ERROR', 'HTTP_ERROR'];
  
  return {
    code,
    message,
    retryable: options.retryable ?? retryableByDefault.includes(code),
    ...options,
  };
}

/**
 * Determine error code from HTTP status
 */
function errorCodeFromStatus(status: number): ErrorCode {
  if (status === 401 || status === 403) return 'AUTH_ERROR';
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'HTTP_ERROR';
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// Implementation
// =============================================================================

export function createWordPressAdapter(
  options: WordPressAdapterOptions
): WordPressAdapter {
  let {
    baseUrl,
    nonce,
    timeout = 30000,
    retries = 2,
    retryDelay = 1000,
    deduplicate = true,
  } = options;

  // Track pending requests for deduplication
  const pendingRequests = new Map<string, Promise<Result<unknown>>>();
  
  // Track abort controllers for cancellation
  const abortControllers = new Map<string, AbortController>();

  /**
   * Generate a unique key for request deduplication
   */
  const getRequestKey = (action: string, data?: Record<string, string>): string => {
    return `${action}:${JSON.stringify(data ?? {})}`;
  };

  /**
   * Execute a single fetch request
   */
  const executeFetch = async <T>(
    action: string,
    data?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<Result<T>> => {
    try {
      const params = new URLSearchParams({
        action,
        nonce,
        ...data,
      });

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
        signal,
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorCode = errorCodeFromStatus(response.status);
        
        // Try to get error message from response
        let message = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.data?.message) {
            message = errorJson.data.message;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        return {
          success: false,
          error: createError(errorCode, message, {
            httpStatus: response.status,
            retryable: response.status >= 500,
          }),
        };
      }

      // Parse JSON response
      let json: WPAjaxResponse<T>;
      try {
        json = await response.json();
      } catch (e) {
        return {
          success: false,
          error: createError('PARSE_ERROR', 'Invalid JSON response', {
            details: e,
            retryable: false,
          }),
        };
      }

      // Handle WordPress AJAX response
      if (json.success) {
        return { success: true, data: json.data as T };
      }

      // Handle WordPress error response
      const errorData = json.data as { message?: string; code?: string };
      const errorCode = errorData.code === 'invalid_nonce' ? 'AUTH_ERROR' : 'SERVER_ERROR';
      
      return {
        success: false,
        error: createError(
          errorCode,
          errorData.message ?? 'Unknown server error',
          { retryable: false }
        ),
      };
    } catch (e) {
      // Handle network errors and aborts
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          return {
            success: false,
            error: createError('NETWORK_ERROR', 'Request was cancelled', {
              retryable: false,
            }),
          };
        }

        if (e.name === 'TypeError' && e.message.includes('Failed to fetch')) {
          return {
            success: false,
            error: createError('NETWORK_ERROR', 'Network request failed', {
              details: e.message,
              retryable: true,
            }),
          };
        }
      }

      return {
        success: false,
        error: createError('UNKNOWN_ERROR', 'An unexpected error occurred', {
          details: e,
          retryable: false,
        }),
      };
    }
  };

  /**
   * Execute fetch with retries
   */
  const fetchWithRetry = async <T>(
    action: string,
    data?: Record<string, string>
  ): Promise<Result<T>> => {
    const requestKey = getRequestKey(action, data);
    
    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllers.set(requestKey, abortController);

    let lastError: AppError | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      // Check if aborted
      if (abortController.signal.aborted) {
        abortControllers.delete(requestKey);
        return {
          success: false,
          error: createError('NETWORK_ERROR', 'Request was cancelled', {
            retryable: false,
          }),
        };
      }

      const result = await executeFetch<T>(action, data, abortController.signal);
      
      if (result.success) {
        abortControllers.delete(requestKey);
        return result;
      }

      lastError = result.error;

      // Don't retry if not retryable
      if (!result.error.retryable) {
        abortControllers.delete(requestKey);
        return result;
      }

      // Don't retry on last attempt
      if (attempt < retries) {
        console.debug(
          `[WordPressAdapter] Retry ${attempt + 1}/${retries} for ${action}`,
          result.error
        );
        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
      }
    }

    abortControllers.delete(requestKey);
    return {
      success: false,
      error: lastError ?? createError('UNKNOWN_ERROR', 'Request failed'),
    };
  };

  /**
   * Main fetch method with optional deduplication
   */
  const fetch = async <T>(
    action: string,
    data?: Record<string, string>
  ): Promise<Result<T>> => {
    if (!deduplicate) {
      return fetchWithRetry<T>(action, data);
    }

    const requestKey = getRequestKey(action, data);

    // Check for pending request
    const pending = pendingRequests.get(requestKey);
    if (pending) {
      console.debug(`[WordPressAdapter] Deduplicating request: ${action}`);
      return pending as Promise<Result<T>>;
    }

    // Create new request
    const requestPromise = fetchWithRetry<T>(action, data);
    pendingRequests.set(requestKey, requestPromise as Promise<Result<unknown>>);

    // Clean up after completion
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });

    return requestPromise;
  };

  const getNonce = () => nonce;
  const getAjaxUrl = () => baseUrl;
  const setNonce = (newNonce: string) => { nonce = newNonce; };
  
  const cancelAll = () => {
    abortControllers.forEach((controller) => controller.abort());
    abortControllers.clear();
    pendingRequests.clear();
  };

  return {
    fetch,
    getNonce,
    getAjaxUrl,
    setNonce,
    cancelAll,
  };
}

// =============================================================================
// Singleton Instance
// =============================================================================

// This would be initialized with settings from PHP
// For now, we'll use a factory pattern

let instance: WordPressAdapter | null = null;

/**
 * Get or create the WordPress adapter singleton
 * Must be called after settings are available (after DOM ready)
 */
export function getWordPressAdapter(): WordPressAdapter {
  if (!instance) {
    // Get settings from global (set by wp_localize_script)
    const settings = (window as { devDebugTool?: { base_url: string; nonce: string } })
      .devDebugTool;

    if (!settings) {
      throw new Error(
        '[DevDebugTool] WordPress adapter not initialized. ' +
        'Settings not found on window.devDebugTool'
      );
    }

    instance = createWordPressAdapter({
      baseUrl: settings.base_url,
      nonce: settings.nonce,
    });
  }

  return instance;
}

/**
 * Convenience export for direct import
 * Note: This will throw if called before settings are available
 */
export const wordpressAdapter = {
  get fetch() { return getWordPressAdapter().fetch; },
  get getNonce() { return getWordPressAdapter().getNonce; },
  get getAjaxUrl() { return getWordPressAdapter().getAjaxUrl; },
  get setNonce() { return getWordPressAdapter().setNonce; },
  get cancelAll() { return getWordPressAdapter().cancelAll; },
};


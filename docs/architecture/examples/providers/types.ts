/**
 * Provider & Variant Type Definitions
 * 
 * This file contains all the type definitions for the unified
 * provider/variant architecture.
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Cleanup function returned by subscriptions
 */
export type Unsubscribe = () => void;

/**
 * Notify function to push data to subscribers
 */
export type Notify<T> = (data: T | null) => void;

// =============================================================================
// Data Source Types
// =============================================================================

/**
 * A data source produces data for a variant.
 * It has a simple start/stop lifecycle.
 */
export interface DataSource<T = unknown> {
  /**
   * Start producing data.
   * Call notify() whenever data changes.
   * Call notify(null) to signal loading state.
   */
  start(notify: Notify<T>): void;

  /**
   * Stop producing data and cleanup subscriptions.
   */
  stop(): void;

  /**
   * Optional: Force refresh current data.
   */
  refresh?(): Promise<void>;
}

/**
 * Context passed to data source factories.
 * Provides access to adapters and settings.
 */
export interface SourceContext {
  /** Provider ID (e.g., 'editor', 'database') */
  providerId: string;

  /** Elementor adapter for editor integrations */
  elementor: IElementorAdapter;

  /** WordPress adapter for AJAX calls */
  wordpress: IWordPressAdapter;

  /** Plugin settings from PHP */
  settings: PluginSettings;
}

/**
 * Factory function to create a data source.
 * @param config - Variant-specific configuration
 * @param context - Shared context with adapters
 */
export type DataSourceFactory<T = unknown, C = unknown> = (
  config: C,
  context: SourceContext
) => DataSource<T>;

// =============================================================================
// Variant Types
// =============================================================================

/**
 * Configuration for a variant (without the factory).
 * Used for UI display.
 */
export interface VariantConfig {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Sort order (lower = first) */
  order?: number;

  /** Icon identifier (e.g., 'eicon-code') */
  icon?: string;

  /** Description for tooltips */
  description?: string;
}

/**
 * Complete variant definition.
 * Combines config with a data source factory.
 */
export interface Variant<T = unknown, C = unknown> extends VariantConfig {
  /** Configuration passed to the data source factory */
  sourceConfig: C;

  /** Factory function to create the data source */
  createSource: DataSourceFactory<T, C>;
}

// =============================================================================
// Variant State Types
// =============================================================================

/**
 * State for a single variant.
 */
export interface VariantState<T = unknown> {
  /** Current data (null if loading or error) */
  data: T | null;

  /** Whether data is being loaded */
  loading: boolean;

  /** Error if fetch/subscription failed */
  error: Error | null;

  /** Timestamp of last successful update */
  lastUpdated: number | null;
}

/**
 * Initial state for a variant.
 */
export const INITIAL_VARIANT_STATE: VariantState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// =============================================================================
// Provider Types
// =============================================================================

/**
 * Complete provider definition.
 */
export interface DataProvider<T = unknown> {
  /** Unique identifier */
  id: string;

  /** Display title */
  title: string;

  /** Sort order (lower = first) */
  order?: number;

  /** All available variants */
  variants: Variant<T>[];

  /** Default variant ID to activate on start */
  defaultVariant: string;

  /** Get message to show when variant has no data */
  getEmptyMessage(variantId: string): string;

  /** Check if data should be displayed (vs empty state) */
  shouldShowData(data: T | null): boolean;
}

// =============================================================================
// Variant Manager Types
// =============================================================================

/**
 * Listener function for state changes.
 */
export type StateListener<T> = (state: VariantState<T>) => void;

/**
 * Variant manager interface.
 */
export interface IVariantManager<T = unknown> {
  /** Get all variant configs (for UI) */
  getVariants(): VariantConfig[];

  /** Get current active variant ID */
  getActiveVariantId(): string | null;

  /** Get state for a specific variant */
  getState(variantId: string): VariantState<T>;

  /** Get state for active variant */
  getActiveState(): VariantState<T>;

  /** Switch to a different variant */
  switchTo(variantId: string): void;

  /** Refresh the active variant */
  refresh(): Promise<void>;

  /** Start the manager with default variant */
  start(): void;

  /** Stop the manager and cleanup */
  stop(): void;

  /** Subscribe to active state changes */
  subscribe(listener: StateListener<T>): Unsubscribe;
}

// =============================================================================
// Adapter Interfaces (simplified for this example)
// =============================================================================

export interface IElementorAdapter {
  onCommand(
    commands: string | string[],
    handler: () => void
  ): Unsubscribe;

  getSelectedElement(): unknown | null;
  getDocumentId(): string;
  isAvailable(): boolean;
}

export interface IWordPressAdapter {
  fetch<R>(action: string, data?: Record<string, string>): Promise<{
    success: boolean;
    data?: R;
    error?: { message: string };
  }>;
}

export interface PluginSettings {
  baseUrl: string;
  nonce: string;
  databaseAjaxAction: string;
  kitId: string;
  currentPostId: string;
  metaKeys: {
    post: string;
    variables: string;
    globalClasses: string;
  };
}



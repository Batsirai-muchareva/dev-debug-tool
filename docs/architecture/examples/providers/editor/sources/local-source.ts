/**
 * Local Element Data Source
 * 
 * Produces data for the currently selected Elementor element.
 * Subscribes to element selection and model changes.
 */

import type {
  DataSource,
  DataSourceFactory,
  SourceContext,
  Notify,
  Unsubscribe,
} from '../../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for the local source
 */
export interface LocalSourceConfig {
  /** Keys to exclude from extracted data */
  excludeKeys?: string[];
}

/**
 * Extracted element data
 */
export interface LocalElementData {
  id: string;
  elType: string;
  widgetType?: string;
  settings: Record<string, unknown>;
  elements?: LocalElementData[];
}

// =============================================================================
// Data Extraction
// =============================================================================

/**
 * Extract data from an Elementor element model
 */
function extractElementData(
  element: unknown,
  excludeKeys: string[]
): LocalElementData | null {
  if (!element) return null;

  try {
    const model = (element as { model?: { toJSON: () => Record<string, unknown> } }).model;
    if (!model || typeof model.toJSON !== 'function') {
      return null;
    }

    const json = model.toJSON();

    // Remove excluded keys
    excludeKeys.forEach((key) => {
      delete json[key];
    });

    return json as unknown as LocalElementData;
  } catch (error) {
    console.error('[LocalSource] Failed to extract element data:', error);
    return null;
  }
}

// =============================================================================
// Source Factory
// =============================================================================

/**
 * Factory to create the local element data source
 */
export const createLocalSource: DataSourceFactory<LocalElementData, LocalSourceConfig> = (
  config,
  context
): DataSource<LocalElementData> => {
  const { elementor } = context;
  const excludeKeys = config.excludeKeys ?? ['defaultEditSettings', 'editSettings'];

  // Internal state
  let notify: Notify<LocalElementData> | null = null;
  let unsubscribeSelect: Unsubscribe | null = null;
  let unsubscribeDeselect: Unsubscribe | null = null;
  let modelCleanup: Unsubscribe | null = null;

  // ---------------------------------------------------------------------------
  // Element Model Subscription
  // ---------------------------------------------------------------------------

  /**
   * Subscribe to changes on an element's model
   */
  const subscribeToModel = (element: unknown): Unsubscribe => {
    const model = (element as { model?: { on: Function; off: Function } }).model;
    if (!model) return () => {};

    const handler = (): void => {
      const data = extractElementData(element, excludeKeys);
      notify?.(data);
    };

    // Subscribe to model changes
    model.on('change', handler);

    return () => {
      model.off('change', handler);
    };
  };

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle element selection
   */
  const handleSelect = (): void => {
    // Cleanup previous model subscription
    modelCleanup?.();
    modelCleanup = null;

    // Get selected element
    const element = elementor.getSelectedElement();

    if (!element) {
      notify?.(null);
      return;
    }

    // Subscribe to model changes
    modelCleanup = subscribeToModel(element);

    // Extract and notify initial data
    const data = extractElementData(element, excludeKeys);
    notify?.(data);
  };

  /**
   * Handle element deselection
   */
  const handleDeselect = (): void => {
    modelCleanup?.();
    modelCleanup = null;
    notify?.(null);
  };

  // ---------------------------------------------------------------------------
  // DataSource Implementation
  // ---------------------------------------------------------------------------

  const start = (notifyFn: Notify<LocalElementData>): void => {
    notify = notifyFn;

    // Signal loading
    notify(null);

    // Subscribe to Elementor events
    unsubscribeSelect = elementor.onCommand(
      'document/elements/select',
      handleSelect
    );

    unsubscribeDeselect = elementor.onCommand(
      [
        'document/elements/deselect',
        'document/elements/deselect-all',
        'document/elements/delete',
        'panel/exit',
      ],
      handleDeselect
    );

    // Check if element is already selected
    handleSelect();
  };

  const stop = (): void => {
    unsubscribeSelect?.();
    unsubscribeDeselect?.();
    modelCleanup?.();

    unsubscribeSelect = null;
    unsubscribeDeselect = null;
    modelCleanup = null;
    notify = null;
  };

  return { start, stop };
};



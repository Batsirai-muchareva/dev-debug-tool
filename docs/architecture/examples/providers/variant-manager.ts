/**
 * Variant Manager
 * 
 * Manages the lifecycle of variants for a provider.
 * Handles switching between variants, caching states, and notifying listeners.
 */

import type {
  Variant,
  VariantConfig,
  VariantState,
  DataSource,
  SourceContext,
  StateListener,
  IVariantManager,
  Unsubscribe,
  Notify,
  INITIAL_VARIANT_STATE,
} from './types';

// =============================================================================
// Variant Manager Implementation
// =============================================================================

export interface VariantManagerOptions<T> {
  /** All available variants */
  variants: Variant<T>[];

  /** Default variant ID */
  defaultVariant: string;

  /** Context with adapters and settings */
  context: SourceContext;

  /** Optional: Enable debug logging */
  debug?: boolean;
}

export function createVariantManager<T>(
  options: VariantManagerOptions<T>
): IVariantManager<T> {
  const { variants, defaultVariant, context, debug = false } = options;

  // ---------------------------------------------------------------------------
  // Internal State
  // ---------------------------------------------------------------------------

  /** Currently active variant ID */
  let activeVariantId: string | null = null;

  /** Currently active data source */
  let activeSource: DataSource<T> | null = null;

  /** Cached states for each variant */
  const states = new Map<string, VariantState<T>>();

  /** Listeners for state changes */
  const listeners = new Set<StateListener<T>>();

  /** Whether the manager has been started */
  let isStarted = false;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const log = (message: string, ...args: unknown[]): void => {
    if (debug) {
      console.debug(`[VariantManager:${context.providerId}] ${message}`, ...args);
    }
  };

  /**
   * Initialize states for all variants
   */
  const initializeStates = (): void => {
    variants.forEach((variant) => {
      states.set(variant.id, {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
      });
    });
  };

  /**
   * Find variant by ID
   */
  const findVariant = (id: string): Variant<T> | undefined => {
    return variants.find((v) => v.id === id);
  };

  /**
   * Update state for a variant
   */
  const updateState = (
    variantId: string,
    update: Partial<VariantState<T>>
  ): void => {
    const current = states.get(variantId);
    if (!current) return;

    const newState: VariantState<T> = { ...current, ...update };
    states.set(variantId, newState);

    log(`State updated for "${variantId}":`, newState);

    // Notify listeners if this is the active variant
    if (variantId === activeVariantId) {
      notifyListeners(newState);
    }
  };

  /**
   * Notify all listeners with new state
   */
  const notifyListeners = (state: VariantState<T>): void => {
    listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('[VariantManager] Listener error:', error);
      }
    });
  };

  /**
   * Create notify function for a specific variant
   */
  const createNotifyForVariant = (variantId: string): Notify<T> => {
    return (data: T | null): void => {
      if (data === null) {
        // null means "loading started"
        updateState(variantId, { loading: true });
      } else {
        // Data received
        updateState(variantId, {
          data,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      }
    };
  };

  /**
   * Stop the current active source
   */
  const stopActiveSource = (): void => {
    if (activeSource) {
      log(`Stopping source for "${activeVariantId}"`);
      activeSource.stop();
      activeSource = null;
    }
  };

  /**
   * Start a source for a variant
   */
  const startSource = (variant: Variant<T>): void => {
    log(`Starting source for "${variant.id}"`);

    // Create the data source
    activeSource = variant.createSource(variant.sourceConfig, context);

    // Create notify function for this variant
    const notify = createNotifyForVariant(variant.id);

    // Start the source
    activeSource.start(notify);
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const getVariants = (): VariantConfig[] => {
    return variants.map(({ id, label, order, icon, description }) => ({
      id,
      label,
      order,
      icon,
      description,
    }));
  };

  const getActiveVariantId = (): string | null => {
    return activeVariantId;
  };

  const getState = (variantId: string): VariantState<T> => {
    return (
      states.get(variantId) ?? {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
      }
    );
  };

  const getActiveState = (): VariantState<T> => {
    if (!activeVariantId) {
      return {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
      };
    }
    return getState(activeVariantId);
  };

  const switchTo = (variantId: string): void => {
    // Validate variant exists
    const variant = findVariant(variantId);
    if (!variant) {
      console.warn(`[VariantManager] Unknown variant: ${variantId}`);
      return;
    }

    // Skip if already active
    if (variantId === activeVariantId) {
      log(`Already on variant "${variantId}", skipping switch`);
      return;
    }

    log(`Switching from "${activeVariantId}" to "${variantId}"`);

    // Stop current source
    stopActiveSource();

    // Update active variant ID
    activeVariantId = variantId;

    // Check if we have cached data for immediate display
    const cachedState = states.get(variantId);
    if (cachedState && cachedState.data !== null) {
      log(`Using cached data for "${variantId}"`);
      notifyListeners(cachedState);
    } else {
      // No cached data, notify loading state
      notifyListeners({
        data: null,
        loading: true,
        error: null,
        lastUpdated: null,
      });
    }

    // Start new source
    startSource(variant);
  };

  const refresh = async (): Promise<void> => {
    if (!activeSource) {
      log('No active source to refresh');
      return;
    }

    if (!activeSource.refresh) {
      log('Active source does not support refresh');
      return;
    }

    if (activeVariantId) {
      updateState(activeVariantId, { loading: true });
    }

    log('Refreshing active source');
    await activeSource.refresh();
  };

  const start = (): void => {
    if (isStarted) {
      log('Already started, ignoring');
      return;
    }

    log(`Starting with default variant: "${defaultVariant}"`);
    isStarted = true;
    initializeStates();
    switchTo(defaultVariant);
  };

  const stop = (): void => {
    if (!isStarted) {
      log('Not started, ignoring stop');
      return;
    }

    log('Stopping manager');
    stopActiveSource();
    activeVariantId = null;
    isStarted = false;
  };

  const subscribe = (listener: StateListener<T>): Unsubscribe => {
    listeners.add(listener);
    log(`Listener added (total: ${listeners.size})`);

    // Immediately notify with current state if active
    if (activeVariantId) {
      const currentState = states.get(activeVariantId);
      if (currentState) {
        listener(currentState);
      }
    }

    return () => {
      listeners.delete(listener);
      log(`Listener removed (total: ${listeners.size})`);
    };
  };

  // ---------------------------------------------------------------------------
  // Return Public Interface
  // ---------------------------------------------------------------------------

  return {
    getVariants,
    getActiveVariantId,
    getState,
    getActiveState,
    switchTo,
    refresh,
    start,
    stop,
    subscribe,
  };
}


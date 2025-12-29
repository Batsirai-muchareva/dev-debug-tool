/**
 * Global Classes Data Source
 * 
 * Produces data about global CSS classes by polling localStorage.
 * Elementor stores global classes in localStorage while editing.
 */

import type {
  DataSource,
  DataSourceFactory,
  SourceContext,
  Notify,
} from '../../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for the global classes source
 */
export interface GlobalClassesSourceConfig {
  /** Polling interval in milliseconds */
  pollInterval?: number;

  /** LocalStorage key to watch */
  storageKey?: string;
}

/**
 * Global class definition
 */
export interface GlobalClass {
  id: string;
  label: string;
  variants: Array<{
    meta: { breakpoint: string; state: string };
    props: Record<string, unknown>;
  }>;
}

/**
 * Global classes data
 */
export interface GlobalClassesData {
  classes: GlobalClass[];
  timestamp: number;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_STORAGE_KEY = '__elementorGlobalClasses';
const DEFAULT_POLL_INTERVAL = 500;

// =============================================================================
// Source Factory
// =============================================================================

/**
 * Factory to create the global classes data source
 */
export const createGlobalClassesSource: DataSourceFactory<
  GlobalClassesData,
  GlobalClassesSourceConfig
> = (config, _context): DataSource<GlobalClassesData> => {
  const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;
  const pollInterval = config.pollInterval ?? DEFAULT_POLL_INTERVAL;

  // Internal state
  let notify: Notify<GlobalClassesData> | null = null;
  let intervalId: number | null = null;
  let lastValue: string | null = null;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Read and parse global classes from localStorage
   */
  const readFromStorage = (): GlobalClassesData | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // Normalize to our data structure
      if (Array.isArray(parsed)) {
        return {
          classes: parsed,
          timestamp: Date.now(),
        };
      }

      if (parsed && typeof parsed === 'object' && 'items' in parsed) {
        return {
          classes: parsed.items ?? [],
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('[GlobalClassesSource] Failed to parse localStorage:', error);
      return null;
    }
  };

  /**
   * Poll for changes in localStorage
   */
  const poll = (): void => {
    const currentValue = localStorage.getItem(storageKey);

    // Only notify if value changed
    if (currentValue !== lastValue) {
      lastValue = currentValue;
      const data = readFromStorage();
      notify?.(data);
    }
  };

  // ---------------------------------------------------------------------------
  // DataSource Implementation
  // ---------------------------------------------------------------------------

  const start = (notifyFn: Notify<GlobalClassesData>): void => {
    notify = notifyFn;

    // Read initial value
    lastValue = localStorage.getItem(storageKey);
    const initialData = readFromStorage();
    notify(initialData);

    // Start polling
    intervalId = window.setInterval(poll, pollInterval);
  };

  const stop = (): void => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    notify = null;
    lastValue = null;
  };

  const refresh = async (): Promise<void> => {
    // Force re-read from storage
    lastValue = null;
    poll();
  };

  return { start, stop, refresh };
};


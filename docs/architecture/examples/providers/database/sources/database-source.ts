/**
 * Database Data Source
 *
 * Fetches Elementor data from the WordPress database via AJAX.
 * Can be configured to fetch different meta keys (post data, variables, etc.)
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
 * Configuration for the database source
 */
export interface DatabaseSourceConfig {
  /** Post meta key to fetch */
  metaKey: string;

  /** Post ID to fetch from */
  postId: string;

  /** Whether to auto-refresh when document is saved */
  refreshOnSave?: boolean;
}

/**
 * Database response data
 */
export interface DatabaseData {
  /** The fetched schema/data */
  schema: unknown;

  /** Post ID the data was fetched from */
  postId: string;

  /** Meta key that was fetched */
  metaKey: string;

  /** Server timestamp */
  timestamp: string;
}

// =============================================================================
// Source Factory
// =============================================================================

/**
 * Factory to create the database data source
 */
export const createDatabaseSource: DataSourceFactory<DatabaseData, DatabaseSourceConfig> = (config, context): DataSource<DatabaseData> => {
  const { wordpress, elementor, settings } = context;
  const { metaKey, postId, refreshOnSave = true } = config;

  // Internal state
  let notify: Notify<DatabaseData> | null = null;
  let unsubscribeSave: Unsubscribe | null = null;
  let isFetching = false;

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  /**
   * Fetch data from the database
   */
  const fetchData = async (): Promise<void> => {
    if (isFetching) {
      console.debug('[DatabaseSource] Fetch already in progress, skipping');
      return;
    }

    isFetching = true;

    // Signal loading
    notify?.(null);

    try {
      const result = await wordpress.fetch<{
        schema: unknown;
        post_id: number;
        timestamp: string;
      }>(settings.databaseAjaxAction, {
        meta_key: metaKey,
        post_id: postId,
      });

      if (result.success && result.data) {
        notify?.({
          schema: result.data.schema,
          postId: String(result.data.post_id),
          metaKey,
          timestamp: result.data.timestamp,
        });
      } else {
        console.error('[DatabaseSource] Fetch failed:', result.error?.message);
        // Still notify with null to clear loading state
        // In a more complete implementation, you'd set an error state
        notify?.(null);
      }
    } catch (error) {
      console.error('[DatabaseSource] Fetch error:', error);
      notify?.(null);
    } finally {
      isFetching = false;
    }
  };

  // ---------------------------------------------------------------------------
  // DataSource Implementation
  // ---------------------------------------------------------------------------

  const start = (notifyFn: Notify<DatabaseData>): void => {
    notify = notifyFn;

    // Initial fetch
    fetchData();

    // Subscribe to save events for auto-refresh
    if (refreshOnSave) {
      unsubscribeSave = elementor.onCommand('document/save/update', () => {
        console.debug('[DatabaseSource] Document saved, refreshing...');
        fetchData();
      } );
    }
  };

  const stop = (): void => {
    unsubscribeSave?.();
    unsubscribeSave = null;
    notify = null;
    isFetching = false;
  };

  const refresh = async (): Promise<void> => {
    await fetchData();
  };

  return { start, stop, refresh };
};



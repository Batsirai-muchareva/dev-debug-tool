/**
 * Database Data Source (with Caching)
 * 
 * Fetches Elementor data from the WordPress database via AJAX.
 * Uses caching to avoid redundant network requests.
 * 
 * Cache Strategy:
 * - Cache responses by postId + metaKey
 * - Return cached data immediately on variant switch
 * - Invalidate cache on document save
 * - Background refresh to update stale data
 */

import type {
  DataSource,
  DataSourceFactory,
  SourceContext,
  Notify,
  Unsubscribe,
} from '../../types';

import {
  getDatabaseCache,
  databaseCacheKey,
  postPattern,
  type ICacheManager,
} from '../../cache';

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

  /** Custom TTL for cache (milliseconds) */
  cacheTTL?: number;

  /** Whether to use cache (default: true) */
  useCache?: boolean;
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

  /** Whether this came from cache */
  fromCache?: boolean;
}

// =============================================================================
// Source Factory
// =============================================================================

/**
 * Factory to create the database data source with caching
 */
export const createDatabaseSource: DataSourceFactory<
  DatabaseData,
  DatabaseSourceConfig
> = (config, context): DataSource<DatabaseData> => {
  const { wordpress, elementor, settings } = context;
  const {
    metaKey,
    postId,
    refreshOnSave = true,
    cacheTTL,
    useCache = true,
  } = config;

  // Get cache instance
  const cache: ICacheManager<DatabaseData> = getDatabaseCache();

  // Generate cache key for this source
  const cacheKey = databaseCacheKey(postId, metaKey);

  // Internal state
  let notify: Notify<DatabaseData> | null = null;
  let unsubscribeSave: Unsubscribe | null = null;
  let isFetching = false;

  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------

  const log = (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DatabaseSource:${metaKey}] ${message}`, ...args);
    }
  };

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  /**
   * Check cache and return data if valid
   */
  const getFromCache = (): DatabaseData | undefined => {
    if (!useCache) return undefined;

    const cached = cache.get(cacheKey);
    if (cached) {
      log('Cache HIT');
      return { ...cached, fromCache: true };
    }

    log('Cache MISS');
    return undefined;
  };

  /**
   * Store data in cache
   */
  const setCache = (data: DatabaseData): void => {
    if (!useCache) return;
    cache.set(cacheKey, data, cacheTTL);
    log('Cached response');
  };

  /**
   * Invalidate cache for this source
   */
  const invalidateCache = (): void => {
    cache.invalidate(cacheKey);
    log('Cache invalidated');
  };

  /**
   * Invalidate all cache for this post (all meta keys)
   */
  const invalidatePostCache = (): void => {
    cache.invalidatePattern(postPattern(postId));
    log('Post cache invalidated');
  };

  /**
   * Fetch data from the server
   */
  const fetchFromServer = async (): Promise<DatabaseData | null> => {
    log('Fetching from server...');

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
        const data: DatabaseData = {
          schema: result.data.schema,
          postId: String(result.data.post_id),
          metaKey,
          timestamp: result.data.timestamp,
          fromCache: false,
        };

        log('Fetch successful');
        return data;
      } else {
        log('Fetch failed:', result.error?.message);
        return null;
      }
    } catch (error) {
      log('Fetch error:', error);
      return null;
    }
  };

  /**
   * Main fetch logic with cache-first strategy
   */
  const fetchData = async (options: { skipCache?: boolean } = {}): Promise<void> => {
    const { skipCache = false } = options;

    if (isFetching) {
      log('Fetch already in progress, skipping');
      return;
    }

    isFetching = true;

    try {
      // Strategy 1: Try cache first (unless skipping)
      if (!skipCache) {
        const cached = getFromCache();
        if (cached) {
          // Notify with cached data immediately
          notify?.(cached);

          // Optional: Background refresh for stale data
          // Could check if data is "stale" and refresh in background
          isFetching = false;
          return;
        }
      }

      // Strategy 2: No cache, signal loading
      notify?.(null);

      // Strategy 3: Fetch from server
      const data = await fetchFromServer();

      if (data) {
        // Cache the response
        setCache(data);

        // Notify with fresh data
        notify?.(data);
      } else {
        // Fetch failed, notify null (will show error/empty state)
        notify?.(null);
      }
    } finally {
      isFetching = false;
    }
  };

  /**
   * Force refresh (skip cache, invalidate, and refetch)
   */
  const forceRefresh = async (): Promise<void> => {
    invalidateCache();
    await fetchData({ skipCache: true });
  };

  // ---------------------------------------------------------------------------
  // Save Event Handler
  // ---------------------------------------------------------------------------

  /**
   * Handle document save event
   */
  const handleSave = (): void => {
    log('Document saved, invalidating cache and refreshing...');

    // Invalidate all cache for this post (data has changed)
    invalidatePostCache();

    // Refetch with a small delay (let save complete)
    setTimeout(() => {
      fetchData({ skipCache: true });
    }, 500);
  };

  // ---------------------------------------------------------------------------
  // DataSource Implementation
  // ---------------------------------------------------------------------------

  const start = (notifyFn: Notify<DatabaseData>): void => {
    notify = notifyFn;

    // Try cache first, then fetch
    fetchData();

    // Subscribe to save events for auto-refresh
    if (refreshOnSave) {
      unsubscribeSave = elementor.onCommand('document/save/update', handleSave);
    }
  };

  const stop = (): void => {
    unsubscribeSave?.();
    unsubscribeSave = null;
    notify = null;
    isFetching = false;
  };

  const refresh = async (): Promise<void> => {
    await forceRefresh();
  };

  return { start, stop, refresh };
};

// =============================================================================
// Cache Statistics Helper
// =============================================================================

/**
 * Get database cache statistics
 */
export function getDatabaseCacheStats() {
  return getDatabaseCache().getStats();
}

/**
 * Clear all database cache
 */
export function clearDatabaseCache() {
  getDatabaseCache().invalidateAll();
}

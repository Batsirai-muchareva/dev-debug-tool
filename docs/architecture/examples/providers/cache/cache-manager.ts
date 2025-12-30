/**
 * Cache Manager
 * 
 * A simple LRU cache with TTL support, designed for caching
 * database responses to avoid redundant AJAX calls.
 * 
 * Terminology:
 * - LRU (Least Recently Used): A cache eviction policy that removes the
 *   least recently accessed entries first when the cache reaches capacity.
 *   This keeps frequently accessed data in cache longer.
 * 
 * - TTL (Time To Live): The maximum duration an entry remains valid in cache.
 *   After TTL expires, the entry is considered stale and will be removed
 *   on next access, forcing a fresh fetch from the server.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  /** Cached value */
  value: T;

  /** When the entry was created */
  createdAt: number;

  /** When the entry expires */
  expiresAt: number;
}

/**
 * Cache statistics for debugging
 */
export interface CacheStats {
  /** Number of cache hits */
  hits: number;

  /** Number of cache misses */
  misses: number;

  /** Current number of entries */
  size: number;

  /** Cache hit rate (0-1) */
  hitRate: number;
}

/**
 * Cache manager options
 */
export interface CacheOptions {
  /**
   * Maximum number of entries
   * @default 50
   */
  maxSize?: number;

  /**
   * Default TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  defaultTTL?: number;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Cache manager interface
 */
export interface ICacheManager<T> {
  /** Get a value from cache */
  get(key: string): T | undefined;

  /** Set a value in cache */
  set(key: string, value: T, ttl?: number): void;

  /** Check if key exists and is valid */
  has(key: string): boolean;

  /** Remove a specific key */
  invalidate(key: string): void;

  /** Remove all entries */
  invalidateAll(): void;

  /** Remove entries matching a pattern */
  invalidatePattern(pattern: RegExp): void;

  /** Get cache statistics */
  getStats(): CacheStats;

  /** Get all keys (for debugging) */
  keys(): string[];
}

// =============================================================================
// Implementation
// =============================================================================

/**
 * Create a cache manager instance
 */
export function createCacheManager<T>(
  options: CacheOptions = {}
): ICacheManager<T> {
  const {
    maxSize = 50,
    defaultTTL = 5 * 60 * 1000, // 5 minutes
    debug = false,
  } = options;

  // Internal storage (Map maintains insertion order for LRU)
  const cache = new Map<string, CacheEntry<T>>();

  // Statistics
  let hits = 0;
  let misses = 0;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const log = (message: string, ...args: unknown[]): void => {
    if (debug) {
      console.debug(`[CacheManager] ${message}`, ...args);
    }
  };

  /**
   * Check if entry is expired
   */
  const isExpired = (entry: CacheEntry<T>): boolean => {
    return Date.now() > entry.expiresAt;
  };

  /**
   * Evict oldest entry (LRU)
   */
  const evictOldest = (): void => {
    if (cache.size === 0) return;

    // Map.keys() returns in insertion order, first is oldest
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
      log(`Evicted oldest entry: ${oldestKey}`);
    }
  };

  /**
   * Move entry to end (most recently used)
   */
  const touch = (key: string, entry: CacheEntry<T>): void => {
    cache.delete(key);
    cache.set(key, entry);
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const get = (key: string): T | undefined => {
    const entry = cache.get(key);

    // Miss: not in cache
    if (!entry) {
      misses++;
      log(`MISS: ${key}`);
      return undefined;
    }

    // Miss: expired
    if (isExpired(entry)) {
      cache.delete(key);
      misses++;
      log(`MISS (expired): ${key}`);
      return undefined;
    }

    // Hit: move to end (LRU)
    touch(key, entry);
    hits++;
    log(`HIT: ${key}`);
    return entry.value;
  };

  const set = (key: string, value: T, ttl = defaultTTL): void => {
    // Remove if exists (will be re-added at end)
    cache.delete(key);

    // Evict if at capacity
    while (cache.size >= maxSize) {
      evictOldest();
    }

    // Add new entry
    const now = Date.now();
    cache.set(key, {
      value,
      createdAt: now,
      expiresAt: now + ttl,
    });

    log(`SET: ${key} (TTL: ${ttl}ms, size: ${cache.size})`);
  };

  const has = (key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return false;
    if (isExpired(entry)) {
      cache.delete(key);
      return false;
    }
    return true;
  };

  const invalidate = (key: string): void => {
    const deleted = cache.delete(key);
    if (deleted) {
      log(`INVALIDATE: ${key}`);
    }
  };

  const invalidateAll = (): void => {
    const size = cache.size;
    cache.clear();
    hits = 0;
    misses = 0;
    log(`INVALIDATE ALL: cleared ${size} entries`);
  };

  const invalidatePattern = (pattern: RegExp): void => {
    const keysToDelete: string[] = [];

    cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => cache.delete(key));
    log(`INVALIDATE PATTERN: ${pattern} (${keysToDelete.length} entries)`);
  };

  const getStats = (): CacheStats => {
    const total = hits + misses;
    return {
      hits,
      misses,
      size: cache.size,
      hitRate: total > 0 ? hits / total : 0,
    };
  };

  const keys = (): string[] => {
    return Array.from(cache.keys());
  };

  return {
    get,
    set,
    has,
    invalidate,
    invalidateAll,
    invalidatePattern,
    getStats,
    keys,
  };
}

// =============================================================================
// Singleton for Database Cache
// =============================================================================

let databaseCacheInstance: ICacheManager<unknown> | null = null;

/**
 * Get the database cache singleton
 */
export function getDatabaseCache<T = unknown>(): ICacheManager<T> {
  if (!databaseCacheInstance) {
    databaseCacheInstance = createCacheManager<unknown>({
      maxSize: 20, // Database responses are larger, keep fewer
      defaultTTL: 2 * 60 * 1000, // 2 minutes (shorter since data can change on save)
      debug: process.env.NODE_ENV === 'development',
    });
  }
  return databaseCacheInstance as ICacheManager<T>;
}

/**
 * Reset the database cache (for testing)
 */
export function resetDatabaseCache(): void {
  databaseCacheInstance?.invalidateAll();
  databaseCacheInstance = null;
}


/**
 * CacheManager - LRU cache with TTL support
 * 
 * This cache is used to prevent redundant data extraction and API calls:
 * - Cache extracted element data by element ID
 * - Cache database responses by post ID + meta key
 * - Invalidate on save events
 * 
 * @example
 * ```typescript
 * import { createCacheManager } from '@app/cache/cache-manager';
 * 
 * // Create a cache for element data
 * const elementCache = createCacheManager<ExtractedData>({
 *   maxSize: 50,
 *   defaultTTL: 5 * 60 * 1000, // 5 minutes
 * });
 * 
 * // Usage
 * const cached = elementCache.get('element-123');
 * if (cached) {
 *   return cached; // Cache hit!
 * }
 * 
 * const data = expensiveExtraction(element);
 * elementCache.set('element-123', data);
 * return data;
 * 
 * // Invalidate on save
 * elementCache.invalidateAll();
 * ```
 */

// =============================================================================
// Types
// =============================================================================

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export interface CacheOptions {
  /**
   * Maximum number of entries in the cache
   * @default 100
   */
  maxSize?: number;

  /**
   * Default TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  defaultTTL?: number;

  /**
   * Called when an entry is evicted (either by LRU or TTL)
   */
  onEvict?: (key: string, value: unknown) => void;
}

export interface CacheManager<T> {
  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined;

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional TTL override in milliseconds
   */
  set(key: string, value: T, ttl?: number): void;

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean;

  /**
   * Remove a specific key from the cache
   */
  invalidate(key: string): void;

  /**
   * Clear all entries from the cache
   */
  invalidateAll(): void;

  /**
   * Invalidate entries matching a pattern
   * @param pattern - Regex pattern to match keys
   */
  invalidatePattern(pattern: RegExp): void;

  /**
   * Get cache statistics
   */
  getStats(): CacheStats;

  /**
   * Get all keys in the cache (for debugging)
   */
  keys(): string[];
}

// =============================================================================
// Implementation
// =============================================================================

/**
 * Create a new cache manager instance
 */
export function createCacheManager<T>(options: CacheOptions = {}): CacheManager<T> {
  const {
    maxSize = 100,
    defaultTTL = 5 * 60 * 1000, // 5 minutes
    onEvict,
  } = options;

  // Internal storage
  const cache = new Map<string, CacheEntry<T>>();
  
  // Statistics
  let hits = 0;
  let misses = 0;

  /**
   * Check if an entry is expired
   */
  const isExpired = (entry: CacheEntry<T>): boolean => {
    return Date.now() > entry.expiresAt;
  };

  /**
   * Evict the oldest entry (LRU)
   */
  const evictOldest = (): void => {
    if (cache.size === 0) return;

    // Map maintains insertion order, so first key is oldest
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      const entry = cache.get(oldestKey);
      cache.delete(oldestKey);
      
      if (onEvict && entry) {
        onEvict(oldestKey, entry.value);
      }
    }
  };

  /**
   * Clean up expired entries (called periodically)
   */
  const cleanupExpired = (): void => {
    const now = Date.now();
    const toDelete: string[] = [];

    cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        toDelete.push(key);
      }
    });

    toDelete.forEach((key) => {
      const entry = cache.get(key);
      cache.delete(key);
      
      if (onEvict && entry) {
        onEvict(key, entry.value);
      }
    });
  };

  // Periodic cleanup (every 60 seconds)
  const cleanupInterval = setInterval(cleanupExpired, 60 * 1000);

  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(cleanupInterval);
    });
  }

  // =============================================================================
  // Public API
  // =============================================================================

  const get = (key: string): T | undefined => {
    const entry = cache.get(key);

    if (!entry) {
      misses++;
      return undefined;
    }

    if (isExpired(entry)) {
      // Entry expired, remove it
      cache.delete(key);
      if (onEvict) {
        onEvict(key, entry.value);
      }
      misses++;
      return undefined;
    }

    // Move to end (most recently used) by re-inserting
    cache.delete(key);
    cache.set(key, entry);

    hits++;
    return entry.value;
  };

  const set = (key: string, value: T, ttl = defaultTTL): void => {
    // If key exists, delete it first (will be re-added at end)
    if (cache.has(key)) {
      cache.delete(key);
    }

    // Evict oldest if at capacity
    while (cache.size >= maxSize) {
      evictOldest();
    }

    const now = Date.now();
    cache.set(key, {
      value,
      expiresAt: now + ttl,
      createdAt: now,
    });
  };

  const has = (key: string): boolean => {
    return get(key) !== undefined;
  };

  const invalidate = (key: string): void => {
    const entry = cache.get(key);
    cache.delete(key);
    
    if (onEvict && entry) {
      onEvict(key, entry.value);
    }
  };

  const invalidateAll = (): void => {
    if (onEvict) {
      cache.forEach((entry, key) => {
        onEvict(key, entry.value);
      });
    }
    cache.clear();
    hits = 0;
    misses = 0;
  };

  const invalidatePattern = (pattern: RegExp): void => {
    const toDelete: string[] = [];

    cache.forEach((_, key) => {
      if (pattern.test(key)) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(invalidate);
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
// Specialized Cache Factories
// =============================================================================

/**
 * Create a cache for element data extraction results
 */
export function createElementDataCache() {
  return createCacheManager<Record<string, unknown>>({
    maxSize: 50,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    onEvict: (key) => {
      console.debug(`[DevDebugTool] Element cache evicted: ${key}`);
    },
  });
}

/**
 * Create a cache for database responses
 */
export function createDatabaseCache() {
  return createCacheManager<unknown>({
    maxSize: 20,
    defaultTTL: 30 * 1000, // 30 seconds (database can change frequently)
    onEvict: (key) => {
      console.debug(`[DevDebugTool] Database cache evicted: ${key}`);
    },
  });
}

// =============================================================================
// Cache Key Helpers
// =============================================================================

/**
 * Generate a cache key for element data
 */
export function elementCacheKey(elementId: string): string {
  return `element:${elementId}`;
}

/**
 * Generate a cache key for database queries
 */
export function databaseCacheKey(postId: string, metaKey: string): string {
  return `db:${postId}:${metaKey}`;
}



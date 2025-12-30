/**
 * Database Cache Keys
 * 
 * Utilities for generating consistent cache keys for database queries.
 */

// =============================================================================
// Key Generation
// =============================================================================

/**
 * Generate a cache key for a database query
 * 
 * @param postId - The post ID
 * @param metaKey - The meta key
 * @returns Cache key string
 * 
 * @example
 * ```typescript
 * const key = databaseCacheKey('123', '_elementor_data');
 * // Returns: 'db:123:_elementor_data'
 * ```
 */
export function databaseCacheKey(postId: string, metaKey: string): string {
  return `db:${postId}:${metaKey}`;
}

/**
 * Parse a database cache key back to its components
 * 
 * @param key - The cache key
 * @returns Object with postId and metaKey, or null if invalid
 */
export function parseDatabaseCacheKey(
  key: string
): { postId: string; metaKey: string } | null {
  const match = key.match(/^db:([^:]+):(.+)$/);
  if (!match) return null;
  return {
    postId: match[1],
    metaKey: match[2],
  };
}

// =============================================================================
// Invalidation Patterns
// =============================================================================

/**
 * Pattern to match all database cache entries
 */
export const ALL_DATABASE_PATTERN = /^db:/;

/**
 * Pattern to match all entries for a specific post
 * 
 * @example
 * ```typescript
 * cache.invalidatePattern(postPattern('123'));
 * // Invalidates: db:123:_elementor_data, db:123:_elementor_css, etc.
 * ```
 */
export function postPattern(postId: string): RegExp {
  return new RegExp(`^db:${postId}:`);
}

/**
 * Pattern to match all entries for a specific meta key across all posts
 * 
 * @example
 * ```typescript
 * cache.invalidatePattern(metaKeyPattern('_elementor_data'));
 * // Invalidates: db:123:_elementor_data, db:456:_elementor_data, etc.
 * ```
 */
export function metaKeyPattern(metaKey: string): RegExp {
  // Escape special regex characters in meta key
  const escaped = metaKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^db:[^:]+:${escaped}$`);
}

// =============================================================================
// Common Meta Keys
// =============================================================================

/**
 * Well-known Elementor meta keys
 */
export const ELEMENTOR_META_KEYS = {
  /** Main page/post Elementor data */
  POST_DATA: '_elementor_data',

  /** Global design variables (colors, fonts) */
  GLOBAL_VARIABLES: '_elementor_global_variables',

  /** Global CSS classes */
  GLOBAL_CLASSES: '_elementor_global_classes',

  /** Page settings */
  PAGE_SETTINGS: '_elementor_page_settings',

  /** Generated CSS */
  CSS: '_elementor_css',
} as const;

export type ElementorMetaKey = typeof ELEMENTOR_META_KEYS[keyof typeof ELEMENTOR_META_KEYS];


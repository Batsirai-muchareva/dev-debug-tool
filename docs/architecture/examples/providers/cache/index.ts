/**
 * Cache Module
 * 
 * Exports cache utilities for the database provider.
 */

export {
  createCacheManager,
  getDatabaseCache,
  resetDatabaseCache,
  type CacheOptions,
  type CacheStats,
  type ICacheManager,
} from './cache-manager';

export {
  databaseCacheKey,
  parseDatabaseCacheKey,
  ALL_DATABASE_PATTERN,
  postPattern,
  metaKeyPattern,
  ELEMENTOR_META_KEYS,
  type ElementorMetaKey,
} from './database-cache-keys';


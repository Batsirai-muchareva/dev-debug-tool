/**
 * Providers Module
 * 
 * This module exports the unified provider/variant architecture.
 * 
 * @example
 * ```typescript
 * import {
 *   // Providers
 *   createEditorProvider,
 *   createDatabaseProvider,
 *   
 *   // Variant Manager
 *   createVariantManager,
 *   
 *   // Hooks
 *   useProvider,
 *   useProviders,
 *   
 *   // Types
 *   type DataProvider,
 *   type Variant,
 *   type DataSource,
 * } from '@app/providers';
 * ```
 */

// =============================================================================
// Types
// =============================================================================

export type {
  // Core types
  Unsubscribe,
  Notify,

  // Data source types
  DataSource,
  DataSourceFactory,
  SourceContext,

  // Variant types
  VariantConfig,
  Variant,
  VariantState,

  // Provider types
  DataProvider,
  StateListener,
  IVariantManager,

  // Adapter interfaces
  IElementorAdapter,
  IWordPressAdapter,
  PluginSettings,
} from './types';

export { INITIAL_VARIANT_STATE } from './types';

// =============================================================================
// Variant Manager
// =============================================================================

export {
  createVariantManager,
  type VariantManagerOptions,
} from './variant-manager';

// =============================================================================
// Editor Provider
// =============================================================================

export {
  createEditorProvider,
  editorProvider,
  type EditorData,
  type EditorVariantId,
} from './editor/provider';

export {
  createLocalSource,
  type LocalSourceConfig,
  type LocalElementData,
} from './editor/sources/local-source';

export {
  createGlobalClassesSource,
  type GlobalClassesSourceConfig,
  type GlobalClassesData,
  type GlobalClass,
} from './editor/sources/global-classes-source';

// =============================================================================
// Database Provider
// =============================================================================

export {
  createDatabaseProvider,
  type DatabaseVariantId,
} from './database/provider';

export {
  createDatabaseSource,
  getDatabaseCacheStats,
  clearDatabaseCache,
  type DatabaseSourceConfig,
  type DatabaseData,
} from './database/sources/database-source';

// =============================================================================
// Hooks
// =============================================================================

export {
  useProvider,
  useProviders,
  type UseProviderResult,
  type UseProvidersResult,
} from './hooks/use-provider';

// =============================================================================
// Cache
// =============================================================================

export {
  // Cache manager
  createCacheManager,
  getDatabaseCache,
  resetDatabaseCache,
  type CacheOptions,
  type CacheStats,
  type ICacheManager,

  // Cache keys
  databaseCacheKey,
  parseDatabaseCacheKey,
  ALL_DATABASE_PATTERN,
  postPattern,
  metaKeyPattern,
  ELEMENTOR_META_KEYS,
  type ElementorMetaKey,
} from './cache';

// =============================================================================
// Provider Registry (Optional)
// =============================================================================

import type { DataProvider, PluginSettings } from './types';
import { createEditorProvider } from './editor/provider';
import { createDatabaseProvider } from './database/provider';

/**
 * Create all providers
 */
export function createProviders(settings: PluginSettings): DataProvider<unknown>[] {
  return [
    createEditorProvider(),
    createDatabaseProvider(settings),
  ].sort((a, b) => (a.order ?? 10) - (b.order ?? 10));
}

/**
 * Get a provider by ID
 */
export function getProvider(
  providers: DataProvider<unknown>[],
  id: string
): DataProvider<unknown> | undefined {
  return providers.find((p) => p.id === id);
}



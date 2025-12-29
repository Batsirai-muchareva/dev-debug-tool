/**
 * Database Provider
 * 
 * Provides access to persisted Elementor data from the WordPress database.
 * 
 * Variants:
 * - post: Current post's Elementor data (_elementor_data)
 * - variables: Global design tokens (colors, fonts, etc.)
 * - global_classes: Global CSS class definitions
 */

import type { DataProvider, Variant, PluginSettings } from '../types';
import {
  createDatabaseSource,
  DatabaseSourceConfig,
  DatabaseData,
} from './sources/database-source';

// =============================================================================
// Types
// =============================================================================

/**
 * Database variant IDs
 */
export type DatabaseVariantId = 'post' | 'variables' | 'global_classes';

// =============================================================================
// Variant Factory
// =============================================================================

/**
 * Create database variants based on settings
 * Settings contain the post IDs and meta keys needed for each variant
 */
function createDatabaseVariants(
  settings: PluginSettings
): Variant<DatabaseData, DatabaseSourceConfig>[] {
  return [
    {
      id: 'post',
      label: 'Post',
      order: 1,
      icon: 'eicon-single-post',
      description: 'Elementor data for the current post',
      sourceConfig: {
        metaKey: settings.metaKeys.post,
        postId: settings.currentPostId,
        refreshOnSave: true,
      },
      createSource: createDatabaseSource,
    },
    {
      id: 'variables',
      label: 'Variables',
      order: 2,
      icon: 'eicon-global-colors',
      description: 'Global design tokens (colors, fonts, sizes)',
      sourceConfig: {
        metaKey: settings.metaKeys.variables,
        postId: settings.kitId,
        refreshOnSave: true,
      },
      createSource: createDatabaseSource,
    },
    {
      id: 'global_classes',
      label: 'Classes',
      order: 3,
      icon: 'eicon-code',
      description: 'Global CSS class definitions',
      sourceConfig: {
        metaKey: settings.metaKeys.globalClasses,
        postId: settings.kitId,
        refreshOnSave: true,
      },
      createSource: createDatabaseSource,
    },
  ];
}

// =============================================================================
// Provider Factory
// =============================================================================

/**
 * Create the Database provider
 * Requires settings because variants depend on post IDs from PHP
 */
export function createDatabaseProvider(
  settings: PluginSettings
): DataProvider<DatabaseData> {
  return {
    id: 'database',
    title: 'Database',
    order: 2,

    variants: createDatabaseVariants(settings),

    defaultVariant: 'post',

    getEmptyMessage(variantId: string): string {
      switch (variantId) {
        case 'post':
          return 'No Elementor data found. Save or publish to populate.';
        case 'variables':
          return 'No global variables defined in Site Settings.';
        case 'global_classes':
          return 'No global classes defined in Site Settings.';
        default:
          return 'No data available';
      }
    },

    shouldShowData(data: DatabaseData | null): boolean {
      if (data === null) return false;

      const { schema } = data;

      // Check for array data
      if (Array.isArray(schema)) {
        return schema.length > 0;
      }

      // Check for object data
      if (schema && typeof schema === 'object') {
        return Object.keys(schema).length > 0;
      }

      return false;
    },
  };
}


/**
 * Editor Provider
 * 
 * Provides access to live Elementor editor data.
 * 
 * Variants:
 * - local: Data for the currently selected element
 * - global_classes: Global CSS classes used by the element
 */

import type { DataProvider, Variant } from '../types';
import {
  createLocalSource,
  LocalSourceConfig,
  LocalElementData,
} from './sources/local-source';
import {
  createGlobalClassesSource,
  GlobalClassesSourceConfig,
  GlobalClassesData,
} from './sources/global-classes-source';

// =============================================================================
// Types
// =============================================================================

/**
 * Union of all editor data types
 */
export type EditorData = LocalElementData | GlobalClassesData;

/**
 * Editor variant IDs
 */
export type EditorVariantId = 'local' | 'global_classes';

// =============================================================================
// Variant Definitions
// =============================================================================

/**
 * Local element variant
 */
const localVariant: Variant<LocalElementData, LocalSourceConfig> = {
  id: 'local',
  label: 'Local',
  order: 1,
  icon: 'eicon-code',
  description: 'View data for the selected element',
  sourceConfig: {
    excludeKeys: ['defaultEditSettings', 'editSettings'],
  },
  createSource: createLocalSource,
};

/**
 * Global classes variant
 */
const globalClassesVariant: Variant<GlobalClassesData, GlobalClassesSourceConfig> = {
  id: 'global_classes',
  label: 'Classes',
  order: 2,
  icon: 'eicon-global-colors',
  description: 'View global CSS classes applied to element',
  sourceConfig: {
    pollInterval: 500,
  },
  createSource: createGlobalClassesSource,
};

// =============================================================================
// Provider Definition
// =============================================================================

/**
 * Create the Editor provider
 */
export function createEditorProvider(): DataProvider<EditorData> {
  return {
    id: 'editor',
    title: 'Editor',
    order: 1,

    variants: [
      localVariant as Variant<EditorData>,
      globalClassesVariant as Variant<EditorData>,
    ],

    defaultVariant: 'local',

    getEmptyMessage(variantId: string): string {
      switch (variantId) {
        case 'local':
          return 'Select an element to see its data';
        case 'global_classes':
          return 'No global classes found. Select an element with classes.';
        default:
          return 'No data available';
      }
    },

    shouldShowData(data: EditorData | null): boolean {
      if (data === null) return false;

      // Check for local element data
      if ('id' in data && 'settings' in data) {
        return true;
      }

      // Check for global classes data
      if ('classes' in data) {
        return data.classes.length > 0;
      }

      return false;
    },
  };
}

// =============================================================================
// Export singleton (optional convenience)
// =============================================================================

export const editorProvider = createEditorProvider();


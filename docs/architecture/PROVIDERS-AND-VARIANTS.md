# Providers, Modes & Variants Architecture

## Diagrams

| Diagram | Description |
|---------|-------------|
| [providers-variants.mmd](./diagrams/providers-variants.mmd) | Component overview showing providers, variants, and sources |
| [variant-lifecycle.mmd](./diagrams/variant-lifecycle.mmd) | Sequence diagram for variant switching flow |
| [variant-state-machine.mmd](./diagrams/variant-state-machine.mmd) | State machine for variant states |
| [provider-class-diagram.mmd](./diagrams/provider-class-diagram.mmd) | Class/interface relationships |

---

## The Problem

Your current architecture has two different patterns for handling data variations:

1. **Editor Provider** uses **Modes** (local, global_classes) with start/stop lifecycle
2. **Database Provider** uses **Variants** (post, variables, global_classes) with parameters

This inconsistency creates:
- Different mental models for similar concepts
- Duplicated event handling logic
- Complex mode switching with manual cleanup
- Tight coupling between variants and UI tabs

---

## Current State Analysis

### Editor Provider (Mode Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                    EditorProvider                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Modes                             │   │
│  │  ┌─────────────┐  ┌─────────────────────────────┐   │   │
│  │  │ local       │  │ global_classes              │   │   │
│  │  │ - start()   │  │ - start()                   │   │   │
│  │  │ - stop()    │  │ - stop()                    │   │   │
│  │  │ - notify()  │  │ - notify()                  │   │   │
│  │  └─────────────┘  └─────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                    switchMode()                             │
│                    (stops current, starts new)              │
└─────────────────────────────────────────────────────────────┘
```

**Issues:**
- Modes manage their own subscriptions (complex cleanup)
- `switchMode()` has imperative start/stop logic
- Mode switching dispatches UI events (leaky abstraction)

### Database Provider (Variant Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                   DatabaseProvider                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Variants (config only)             │   │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │ post        │  │ variables  │  │ global_classes│  │   │
│  │  │ - metaKey   │  │ - metaKey  │  │ - metaKey    │  │   │
│  │  │ - postId    │  │ - postId   │  │ - postId     │  │   │
│  │  └─────────────┘  └────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                   get(metaKey, postId)                      │
│                   (stateless fetch)                         │
└─────────────────────────────────────────────────────────────┘
```

**Issues:**
- Variants are just config, but used inconsistently with Editor modes
- Both listen to custom events for switching (duplicated pattern)
- No shared abstraction for "active variant" concept

---

## Proposed Architecture

### Core Insight

Both providers need the same thing:
1. **Multiple data sources** (variants) with different configurations
2. **Active variant selection** (which one is currently displayed)
3. **Lifecycle management** (setup, teardown, refresh)
4. **Unified notification** (push data to UI)

### Solution: Unified Variant System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DataProvider                                    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      VariantManager                                 │ │
│  │                                                                     │ │
│  │  ┌─────────────────┐                                               │ │
│  │  │ Variants        │  ┌────────────────────────────────────┐      │ │
│  │  │ (Map)           │  │ Active Variant                     │      │ │
│  │  │                 │  │                                    │      │ │
│  │  │ - variant_a ────┼──│► id, config, dataSource            │      │ │
│  │  │ - variant_b     │  │  subscribe(), unsubscribe()        │      │ │
│  │  │ - variant_c     │  │                                    │      │ │
│  │  └─────────────────┘  └────────────────────────────────────┘      │ │
│  │                                                                     │ │
│  │  switchVariant(id) → stops current → starts new → notifies         │ │
│  │  refresh()         → re-fetches active variant                      │ │
│  │  getVariants()     → returns all variant configs                    │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Type Definitions

```typescript
// =============================================================================
// core/providers/types.ts
// =============================================================================

/**
 * Configuration for a single variant
 */
export interface VariantConfig {
  id: string;
  label: string;
  
  /** Optional: Order for UI display */
  order?: number;
  
  /** Optional: Icon identifier */
  icon?: string;
  
  /** Optional: Description for tooltips */
  description?: string;
}

/**
 * A data source that can be subscribed to
 * This is the "engine" that produces data for a variant
 */
export interface DataSource<T = unknown> {
  /** Start producing data, call notify when data changes */
  start(notify: (data: T | null) => void): void;
  
  /** Stop producing data, cleanup subscriptions */
  stop(): void;
  
  /** Optional: Force refresh current data */
  refresh?(): Promise<void>;
}

/**
 * Factory function to create a data source
 * This allows lazy initialization and dependency injection
 */
export type DataSourceFactory<T = unknown, C = unknown> = (
  config: C,
  context: ProviderContext
) => DataSource<T>;

/**
 * Complete variant definition
 */
export interface Variant<T = unknown, C = unknown> extends VariantConfig {
  /** Configuration passed to the data source factory */
  sourceConfig: C;
  
  /** Factory to create the data source */
  createSource: DataSourceFactory<T, C>;
}

/**
 * Provider context passed to data sources
 */
export interface ProviderContext {
  /** Provider ID */
  providerId: string;
  
  /** Notify function to push data to UI */
  notify: (data: unknown) => void;
  
  /** Get settings from PHP */
  getSettings: () => PluginSettings;
  
  /** Elementor adapter */
  elementor: IElementorAdapter;
  
  /** WordPress adapter */
  wordpress: IWordPressAdapter;
}

/**
 * State for a variant
 */
export interface VariantState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: number | null;
}

/**
 * Complete provider definition
 */
export interface DataProvider<T = unknown> {
  id: string;
  title: string;
  order?: number;
  
  /** All available variants */
  variants: Variant<T>[];
  
  /** Default variant ID */
  defaultVariant: string;
  
  /** Message to show when no data */
  getEmptyMessage(variantId: string): string;
  
  /** Check if data should be displayed */
  shouldShowData(data: T | null): boolean;
}
```

---

## Variant Manager Implementation

```typescript
// =============================================================================
// core/providers/variant-manager.ts
// =============================================================================

import type {
  Variant,
  DataSource,
  VariantState,
  ProviderContext,
} from './types';

export interface VariantManager<T = unknown> {
  /** Get all variant configs (for UI) */
  getVariants(): Variant<T>[];
  
  /** Get current active variant ID */
  getActiveVariantId(): string | null;
  
  /** Get state for a specific variant */
  getState(variantId: string): VariantState<T>;
  
  /** Switch to a different variant */
  switchTo(variantId: string): void;
  
  /** Refresh the active variant */
  refresh(): Promise<void>;
  
  /** Start the manager (called on mount) */
  start(defaultVariantId: string): void;
  
  /** Stop the manager (called on unmount) */
  stop(): void;
  
  /** Subscribe to state changes */
  subscribe(listener: (state: VariantState<T>) => void): () => void;
}

export function createVariantManager<T>(
  variants: Variant<T>[],
  context: ProviderContext
): VariantManager<T> {
  // Internal state
  let activeVariantId: string | null = null;
  let activeSource: DataSource<T> | null = null;
  const states = new Map<string, VariantState<T>>();
  const listeners = new Set<(state: VariantState<T>) => void>();

  // Initialize states for all variants
  variants.forEach((variant) => {
    states.set(variant.id, {
      data: null,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  });

  /**
   * Update state and notify listeners
   */
  const updateState = (
    variantId: string,
    update: Partial<VariantState<T>>
  ): void => {
    const current = states.get(variantId);
    if (!current) return;

    const newState = { ...current, ...update };
    states.set(variantId, newState);

    // Only notify if this is the active variant
    if (variantId === activeVariantId) {
      listeners.forEach((listener) => listener(newState));
    }
  };

  /**
   * Create notify function for a specific variant
   */
  const createNotify = (variantId: string) => (data: T | null): void => {
    if (data === null) {
      // null means "loading"
      updateState(variantId, { loading: true });
    } else {
      updateState(variantId, {
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    }
  };

  /**
   * Find variant by ID
   */
  const findVariant = (id: string): Variant<T> | undefined => {
    return variants.find((v) => v.id === id);
  };

  // ==========================================================================
  // Public API
  // ==========================================================================

  const getVariants = (): Variant<T>[] => variants;

  const getActiveVariantId = (): string | null => activeVariantId;

  const getState = (variantId: string): VariantState<T> => {
    return (
      states.get(variantId) ?? {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
      }
    );
  };

  const switchTo = (variantId: string): void => {
    // Validate variant exists
    const variant = findVariant(variantId);
    if (!variant) {
      console.warn(`[VariantManager] Unknown variant: ${variantId}`);
      return;
    }

    // Skip if already active
    if (variantId === activeVariantId) {
      return;
    }

    // Stop current source
    if (activeSource) {
      activeSource.stop();
      activeSource = null;
    }

    // Update active ID
    activeVariantId = variantId;

    // Check if we have cached data
    const cachedState = states.get(variantId);
    if (cachedState?.data !== null) {
      // Notify with cached data immediately
      listeners.forEach((listener) => listener(cachedState));
    }

    // Create and start new source
    activeSource = variant.createSource(variant.sourceConfig, context);
    activeSource.start(createNotify(variantId));

    console.debug(`[VariantManager] Switched to: ${variantId}`);
  };

  const refresh = async (): Promise<void> => {
    if (!activeSource?.refresh) {
      console.warn('[VariantManager] Active source does not support refresh');
      return;
    }

    if (activeVariantId) {
      updateState(activeVariantId, { loading: true });
    }

    await activeSource.refresh();
  };

  const start = (defaultVariantId: string): void => {
    switchTo(defaultVariantId);
  };

  const stop = (): void => {
    if (activeSource) {
      activeSource.stop();
      activeSource = null;
    }
    activeVariantId = null;
  };

  const subscribe = (
    listener: (state: VariantState<T>) => void
  ): (() => void) => {
    listeners.add(listener);

    // Immediately notify with current state
    if (activeVariantId) {
      const currentState = states.get(activeVariantId);
      if (currentState) {
        listener(currentState);
      }
    }

    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getVariants,
    getActiveVariantId,
    getState,
    switchTo,
    refresh,
    start,
    stop,
    subscribe,
  };
}
```

---

## Refactored Editor Provider

```typescript
// =============================================================================
// core/providers/editor-provider/provider.ts
// =============================================================================

import type { DataProvider, Variant, DataSource, ProviderContext } from '../types';
import { createLocalDataSource } from './sources/local-source';
import { createGlobalClassesDataSource } from './sources/global-classes-source';

/**
 * Editor provider configuration
 */
export interface EditorProviderConfig {
  // No additional config needed
}

/**
 * Editor data types
 */
export interface LocalElementData {
  id: string;
  elType: string;
  settings: Record<string, unknown>;
  // ... other properties
}

export interface GlobalClassesData {
  classes: Array<{
    id: string;
    label: string;
    variants: unknown[];
  }>;
}

export type EditorData = LocalElementData | GlobalClassesData;

/**
 * Define editor variants
 */
const createEditorVariants = (): Variant<EditorData>[] => [
  {
    id: 'local',
    label: 'Local',
    order: 1,
    description: 'Selected element data',
    sourceConfig: {},
    createSource: createLocalDataSource,
  },
  {
    id: 'global_classes',
    label: 'Classes',
    order: 2,
    description: 'Global CSS classes applied to element',
    sourceConfig: {},
    createSource: createGlobalClassesDataSource,
  },
  // Future variants:
  // {
  //   id: 'global_colors',
  //   label: 'Colors',
  //   sourceConfig: {},
  //   createSource: createGlobalColorsDataSource,
  // },
];

/**
 * Create the editor provider definition
 */
export function createEditorProvider(): DataProvider<EditorData> {
  return {
    id: 'editor',
    title: 'Editor',
    order: 1,
    variants: createEditorVariants(),
    defaultVariant: 'local',

    getEmptyMessage(variantId: string): string {
      switch (variantId) {
        case 'local':
          return 'Select an element to see its data';
        case 'global_classes':
          return 'Select an element with global classes';
        default:
          return 'No data available';
      }
    },

    shouldShowData(data: EditorData | null): boolean {
      return data !== null;
    },
  };
}
```

---

## Data Source Examples

```typescript
// =============================================================================
// core/providers/editor-provider/sources/local-source.ts
// =============================================================================

import type { DataSource, DataSourceFactory, ProviderContext } from '../../types';
import type { LocalElementData } from '../provider';

/**
 * Local source config (empty for now, but extensible)
 */
export interface LocalSourceConfig {
  excludeKeys?: string[];
}

/**
 * Factory to create local element data source
 */
export const createLocalDataSource: DataSourceFactory<
  LocalElementData,
  LocalSourceConfig
> = (config, context) => {
  const { elementor } = context;
  const excludeKeys = config.excludeKeys ?? ['defaultEditSettings', 'editSettings'];

  let unsubscribeSelect: (() => void) | null = null;
  let unsubscribeDeselect: (() => void) | null = null;
  let elementCleanup: (() => void) | null = null;
  let notify: ((data: LocalElementData | null) => void) | null = null;

  /**
   * Extract data from element model
   */
  const extractData = (element: unknown): LocalElementData | null => {
    if (!element) return null;

    try {
      const model = (element as any).model;
      if (!model) return null;

      const json = model.toJSON();

      // Remove excluded keys
      excludeKeys.forEach((key) => delete json[key]);

      return json as LocalElementData;
    } catch (e) {
      console.error('[LocalSource] Failed to extract data:', e);
      return null;
    }
  };

  /**
   * Subscribe to element model changes
   */
  const subscribeToElement = (element: unknown): (() => void) => {
    const model = (element as any).model;
    if (!model) return () => {};

    const handler = () => {
      notify?.(extractData(element));
    };

    model.on('change', handler);

    return () => {
      model.off('change', handler);
    };
  };

  /**
   * Handle element selection
   */
  const handleSelect = (): void => {
    // Cleanup previous element subscription
    elementCleanup?.();
    elementCleanup = null;

    const element = elementor.getSelectedElement();

    if (!element) {
      notify?.(null);
      return;
    }

    // Subscribe to element changes
    elementCleanup = subscribeToElement(element);

    // Notify with initial data
    notify?.(extractData(element));
  };

  /**
   * Handle element deselection
   */
  const handleDeselect = (): void => {
    elementCleanup?.();
    elementCleanup = null;
    notify?.(null);
  };

  // ==========================================================================
  // DataSource Implementation
  // ==========================================================================

  const start = (notifyFn: (data: LocalElementData | null) => void): void => {
    notify = notifyFn;

    // Subscribe to Elementor events
    unsubscribeSelect = elementor.onCommand(
      'document/elements/select',
      handleSelect
    );

    unsubscribeDeselect = elementor.onCommand(
      [
        'document/elements/deselect',
        'document/elements/deselect-all',
        'document/elements/delete',
        'panel/exit',
      ],
      handleDeselect
    );

    // Check if element is already selected
    handleSelect();
  };

  const stop = (): void => {
    unsubscribeSelect?.();
    unsubscribeDeselect?.();
    elementCleanup?.();

    unsubscribeSelect = null;
    unsubscribeDeselect = null;
    elementCleanup = null;
    notify = null;
  };

  return { start, stop };
};
```

```typescript
// =============================================================================
// core/providers/editor-provider/sources/global-classes-source.ts
// =============================================================================

import type { DataSource, DataSourceFactory, ProviderContext } from '../../types';
import type { GlobalClassesData } from '../provider';

const STORAGE_KEY = '__elementorGlobalClasses';
const POLL_INTERVAL = 500;
const IDLE_TIMEOUT = 5000;

export interface GlobalClassesSourceConfig {
  pollInterval?: number;
  idleTimeout?: number;
}

export const createGlobalClassesDataSource: DataSourceFactory<
  GlobalClassesData,
  GlobalClassesSourceConfig
> = (config, context) => {
  const pollInterval = config.pollInterval ?? POLL_INTERVAL;
  const idleTimeout = config.idleTimeout ?? IDLE_TIMEOUT;

  let notify: ((data: GlobalClassesData | null) => void) | null = null;
  let intervalId: number | null = null;
  let lastValue: string | null = null;
  let lastChangeTime: number = Date.now();

  /**
   * Read from localStorage
   */
  const readStorage = (): GlobalClassesData | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  /**
   * Poll for changes
   */
  const poll = (): void => {
    const current = localStorage.getItem(STORAGE_KEY);

    if (current !== lastValue) {
      lastValue = current;
      lastChangeTime = Date.now();
      notify?.(current ? JSON.parse(current) : null);
    }

    // Check for idle timeout (no changes for a while)
    if (Date.now() - lastChangeTime > idleTimeout) {
      // Could emit an "idle" event or switch back to local mode
      // For now, just continue polling
    }
  };

  const start = (notifyFn: (data: GlobalClassesData | null) => void): void => {
    notify = notifyFn;

    // Get initial value
    lastValue = localStorage.getItem(STORAGE_KEY);
    notify(readStorage());

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

  return { start, stop };
};
```

---

## Refactored Database Provider

```typescript
// =============================================================================
// core/providers/database-provider/provider.ts
// =============================================================================

import type { DataProvider, Variant } from '../types';
import { createDatabaseDataSource, DatabaseSourceConfig } from './sources/database-source';

export interface DatabaseData {
  schema: unknown;
  post_id?: number;
  timestamp?: string;
}

/**
 * Define database variants
 */
const createDatabaseVariants = (settings: PluginSettings): Variant<DatabaseData, DatabaseSourceConfig>[] => [
  {
    id: 'post',
    label: 'Post',
    order: 1,
    description: 'Current post Elementor data',
    sourceConfig: {
      metaKey: settings.metaKeys.post,
      postId: settings.currentPostId,
      refreshOnSave: true,
    },
    createSource: createDatabaseDataSource,
  },
  {
    id: 'variables',
    label: 'Variables',
    order: 2,
    description: 'Global design tokens',
    sourceConfig: {
      metaKey: settings.metaKeys.variables,
      postId: settings.kitId,
      refreshOnSave: true,
    },
    createSource: createDatabaseDataSource,
  },
  {
    id: 'global_classes',
    label: 'Classes',
    order: 3,
    description: 'Global CSS classes',
    sourceConfig: {
      metaKey: settings.metaKeys.globalClasses,
      postId: settings.kitId,
      refreshOnSave: true,
    },
    createSource: createDatabaseDataSource,
  },
];

/**
 * Create the database provider
 */
export function createDatabaseProvider(settings: PluginSettings): DataProvider<DatabaseData> {
  return {
    id: 'database',
    title: 'Database',
    order: 2,
    variants: createDatabaseVariants(settings),
    defaultVariant: 'post',

    getEmptyMessage(variantId: string): string {
      switch (variantId) {
        case 'post':
          return 'No Elementor data found. Publish to save.';
        case 'variables':
          return 'No global variables defined';
        case 'global_classes':
          return 'No global classes defined';
        default:
          return 'No data available';
      }
    },

    shouldShowData(data: DatabaseData | null): boolean {
      if (!data?.schema) return false;
      if (Array.isArray(data.schema)) return data.schema.length > 0;
      return Object.keys(data.schema).length > 0;
    },
  };
}
```

```typescript
// =============================================================================
// core/providers/database-provider/sources/database-source.ts
// =============================================================================

import type { DataSource, DataSourceFactory, ProviderContext } from '../../types';
import type { DatabaseData } from '../provider';

export interface DatabaseSourceConfig {
  metaKey: string;
  postId: string;
  refreshOnSave?: boolean;
}

export const createDatabaseDataSource: DataSourceFactory<
  DatabaseData,
  DatabaseSourceConfig
> = (config, context) => {
  const { wordpress, elementor } = context;
  const { metaKey, postId, refreshOnSave = true } = config;

  let notify: ((data: DatabaseData | null) => void) | null = null;
  let unsubscribeSave: (() => void) | null = null;

  /**
   * Fetch data from database
   */
  const fetchData = async (): Promise<void> => {
    notify?.(null); // Signal loading

    const result = await wordpress.fetch<DatabaseData>(
      context.getSettings().databaseAjaxAction,
      {
        meta_key: metaKey,
        post_id: postId,
      }
    );

    if (result.success) {
      notify?.(result.data);
    } else {
      console.error('[DatabaseSource] Fetch failed:', result.error);
      notify?.(null);
    }
  };

  const start = (notifyFn: (data: DatabaseData | null) => void): void => {
    notify = notifyFn;

    // Initial fetch
    fetchData();

    // Subscribe to save events for auto-refresh
    if (refreshOnSave) {
      unsubscribeSave = elementor.onCommand(
        'document/save/update',
        () => {
          fetchData();
        }
      );
    }
  };

  const stop = (): void => {
    unsubscribeSave?.();
    unsubscribeSave = null;
    notify = null;
  };

  const refresh = async (): Promise<void> => {
    await fetchData();
  };

  return { start, stop, refresh };
};
```

---

## React Integration

```typescript
// =============================================================================
// core/providers/hooks/use-provider.ts
// =============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DataProvider, VariantState } from '../types';
import { createVariantManager, VariantManager } from '../variant-manager';

export interface UseProviderResult<T> {
  /** Current data */
  data: T | null;
  
  /** Loading state */
  loading: boolean;
  
  /** Error if any */
  error: Error | null;
  
  /** Active variant ID */
  activeVariant: string;
  
  /** All available variants (for UI) */
  variants: Array<{ id: string; label: string }>;
  
  /** Switch to a different variant */
  switchVariant: (id: string) => void;
  
  /** Refresh current data */
  refresh: () => Promise<void>;
}

export function useProvider<T>(
  provider: DataProvider<T>,
  context: ProviderContext
): UseProviderResult<T> {
  // Create variant manager once
  const manager = useMemo(
    () => createVariantManager(provider.variants, context),
    [provider.id]
  );

  // State
  const [state, setState] = useState<VariantState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const [activeVariant, setActiveVariant] = useState(provider.defaultVariant);

  // Start manager on mount
  useEffect(() => {
    manager.start(provider.defaultVariant);

    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
      manager.stop();
    };
  }, [manager, provider.defaultVariant]);

  // Switch variant handler
  const switchVariant = useCallback(
    (id: string) => {
      setActiveVariant(id);
      manager.switchTo(id);
    },
    [manager]
  );

  // Refresh handler
  const refresh = useCallback(() => manager.refresh(), [manager]);

  // Get variant list for UI
  const variants = useMemo(
    () =>
      provider.variants.map((v) => ({
        id: v.id,
        label: v.label,
      })),
    [provider.variants]
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    activeVariant,
    variants,
    switchVariant,
    refresh,
  };
}
```

---

## Benefits of This Architecture

| Aspect | Before | After |
|--------|--------|-------|
| **Consistency** | Two different patterns (modes vs variants) | Single unified pattern |
| **Type Safety** | Heavy use of `any` | Fully typed with generics |
| **Testability** | Hard to test (global state, events) | DataSources are pure, easily mocked |
| **Extensibility** | Add mode in multiple places | Just add a variant object |
| **Caching** | None | Built into VariantManager |
| **Cleanup** | Manual, error-prone | Automatic lifecycle management |
| **UI Coupling** | Providers dispatch UI events | Clean separation via hooks |

---

## Migration Steps

### Step 1: Create Type Definitions
- Add `core/providers/types.ts` with all interfaces

### Step 2: Create VariantManager
- Add `core/providers/variant-manager.ts`

### Step 3: Refactor Editor Provider
1. Create `sources/local-source.ts`
2. Create `sources/global-classes-source.ts`
3. Update `provider.ts` to use new structure

### Step 4: Refactor Database Provider
1. Create `sources/database-source.ts`
2. Update `provider.ts` to use new structure

### Step 5: Update React Hooks
1. Create `hooks/use-provider.ts`
2. Update components to use new hook

### Step 6: Remove Old Code
- Delete `modes/` folder
- Remove old event dispatching

---

## File Structure

```
core/providers/
├── types.ts                    # Shared type definitions
├── variant-manager.ts          # Core variant management
├── provider-registry.ts        # Registry for all providers
│
├── editor-provider/
│   ├── provider.ts             # Provider definition
│   └── sources/
│       ├── local-source.ts     # Local element data source
│       └── global-classes-source.ts
│
├── database-provider/
│   ├── provider.ts             # Provider definition
│   └── sources/
│       └── database-source.ts  # Database fetch source
│
└── hooks/
    ├── use-provider.ts         # Main provider hook
    └── use-providers.ts        # Hook for multiple providers
```

---

## See Also

- [TO-BE-ARCHITECTURE.md](./TO-BE-ARCHITECTURE.md)
- [MIGRATION-PLAN.md](./MIGRATION-PLAN.md)


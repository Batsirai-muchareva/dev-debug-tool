/**
 * useProvider Hook
 * 
 * React hook for consuming a provider with variant management.
 * Handles lifecycle, state updates, and provides a clean API.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  DataProvider,
  VariantConfig,
  VariantState,
  SourceContext,
  Unsubscribe,
} from '../types';
import { createVariantManager, type IVariantManager } from '../variant-manager';

// =============================================================================
// Types
// =============================================================================

/**
 * Return type for useProvider hook
 */
export interface UseProviderResult<T> {
  /** Current data (null if loading or no data) */
  data: T | null;

  /** Whether data is loading */
  loading: boolean;

  /** Error if fetch failed */
  error: Error | null;

  /** Active variant ID */
  activeVariant: string;

  /** All available variants (for rendering tabs) */
  variants: VariantConfig[];

  /** Switch to a different variant */
  switchVariant: (variantId: string) => void;

  /** Refresh current variant data */
  refresh: () => Promise<void>;

  /** Message to show when no data */
  emptyMessage: string;

  /** Whether to show data (vs empty state) */
  hasData: boolean;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook to consume a provider
 * 
 * @example
 * ```tsx
 * function EditorPanel() {
 *   const {
 *     data,
 *     loading,
 *     activeVariant,
 *     variants,
 *     switchVariant,
 *     hasData,
 *     emptyMessage,
 *   } = useProvider(editorProvider, context);
 * 
 *   return (
 *     <div>
 *       <Tabs>
 *         {variants.map(v => (
 *           <Tab
 *             key={v.id}
 *             active={v.id === activeVariant}
 *             onClick={() => switchVariant(v.id)}
 *           >
 *             {v.label}
 *           </Tab>
 *         ))}
 *       </Tabs>
 * 
 *       {loading && <Spinner />}
 *       {!hasData && <EmptyState message={emptyMessage} />}
 *       {hasData && <JsonViewer data={data} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProvider<T>(
  provider: DataProvider<T>,
  context: SourceContext
): UseProviderResult<T> {
  // ---------------------------------------------------------------------------
  // Create Variant Manager (memoized)
  // ---------------------------------------------------------------------------

  const manager = useMemo<IVariantManager<T>>(() => {
    return createVariantManager({
      variants: provider.variants,
      defaultVariant: provider.defaultVariant,
      context,
      debug: process.env.NODE_ENV === 'development',
    });
  }, [provider.id]); // Only recreate if provider changes

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [state, setState] = useState<VariantState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const [activeVariant, setActiveVariant] = useState<string>(
    provider.defaultVariant
  );

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Start the manager
    manager.start();

    // Subscribe to state changes
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    // Sync active variant
    const checkActiveVariant = (): void => {
      const currentActive = manager.getActiveVariantId();
      if (currentActive && currentActive !== activeVariant) {
        setActiveVariant(currentActive);
      }
    };

    // Check periodically (could also be event-driven)
    const intervalId = setInterval(checkActiveVariant, 100);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      unsubscribe();
      manager.stop();
    };
  }, [manager]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const switchVariant = useCallback(
    (variantId: string): void => {
      setActiveVariant(variantId);
      manager.switchTo(variantId);
    },
    [manager]
  );

  const refresh = useCallback(async (): Promise<void> => {
    await manager.refresh();
  }, [manager]);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  const variants = useMemo<VariantConfig[]>(() => {
    return manager.getVariants();
  }, [manager]);

  const emptyMessage = useMemo<string>(() => {
    return provider.getEmptyMessage(activeVariant);
  }, [provider, activeVariant]);

  const hasData = useMemo<boolean>(() => {
    return provider.shouldShowData(state.data);
  }, [provider, state.data]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    activeVariant,
    variants,
    switchVariant,
    refresh,
    emptyMessage,
    hasData,
  };
}

// =============================================================================
// Multiple Providers Hook
// =============================================================================

/**
 * Hook for managing multiple providers (e.g., Editor + Database)
 */
export interface UseProvidersResult {
  /** Active provider ID */
  activeProvider: string;

  /** All providers */
  providers: Array<{ id: string; title: string }>;

  /** Switch to a different provider */
  switchProvider: (providerId: string) => void;

  /** Get hook result for a specific provider */
  getProviderState: <T>(providerId: string) => UseProviderResult<T> | null;
}

/**
 * Hook to manage multiple providers
 * 
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const {
 *     activeProvider,
 *     providers,
 *     switchProvider,
 *   } = useProviders([editorProvider, databaseProvider], context);
 * 
 *   return (
 *     <div>
 *       <ProviderTabs>
 *         {providers.map(p => (
 *           <Tab
 *             key={p.id}
 *             active={p.id === activeProvider}
 *             onClick={() => switchProvider(p.id)}
 *           >
 *             {p.title}
 *           </Tab>
 *         ))}
 *       </ProviderTabs>
 * 
 *       {activeProvider === 'editor' && <EditorPanel />}
 *       {activeProvider === 'database' && <DatabasePanel />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProviders(
  providerDefinitions: DataProvider<unknown>[],
  defaultProvider?: string
): UseProvidersResult {
  const [activeProvider, setActiveProvider] = useState<string>(
    defaultProvider ?? providerDefinitions[0]?.id ?? ''
  );

  const providers = useMemo(() => {
    return providerDefinitions
      .sort((a, b) => (a.order ?? 10) - (b.order ?? 10))
      .map((p) => ({ id: p.id, title: p.title }));
  }, [providerDefinitions]);

  const switchProvider = useCallback((providerId: string): void => {
    setActiveProvider(providerId);
  }, []);

  // This is a simplified version - in practice you'd want to
  // create and manage variant managers for each provider
  const getProviderState = useCallback(
    <T,>(_providerId: string): UseProviderResult<T> | null => {
      // Implementation would return the state for the specified provider
      // This requires more complex state management
      return null;
    },
    []
  );

  return {
    activeProvider,
    providers,
    switchProvider,
    getProviderState,
  };
}



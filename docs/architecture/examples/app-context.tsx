/**
 * AppContext - Consolidated state management
 * 
 * This context replaces the 4 separate contexts (Popover, Tabs, Filter, Bounds)
 * with a single, unified state managed by a reducer.
 * 
 * Benefits:
 * - Single source of truth
 * - Predictable state updates via reducer
 * - Better performance (single context vs 4 nested)
 * - Easier to debug and test
 * - Supports state persistence
 * 
 * @example
 * ```tsx
 * // In App.tsx
 * import { AppProvider } from '@app/state/app-context';
 * 
 * export const App = () => (
 *   <AppProvider>
 *     <Panel />
 *   </AppProvider>
 * );
 * 
 * // In any component
 * import { useAppState, useAppDispatch } from '@app/state/app-context';
 * 
 * const Component = () => {
 *   const state = useAppState();
 *   const dispatch = useAppDispatch();
 * 
 *   const handleToggle = () => {
 *     dispatch({ type: 'POPOVER_TOGGLE', payload: { id: 'main' } });
 *   };
 * 
 *   return <button onClick={handleToggle}>Toggle</button>;
 * };
 * ```
 */

import * as React from 'react';
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  PropsWithChildren,
  Dispatch,
} from 'react';

// =============================================================================
// Types
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Suggestion {
  path: string;
  value: unknown;
  type: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Application state shape
 */
export interface AppState {
  // Popover state (from PopoverContext)
  popovers: {
    main: {
      isOpen: boolean;
      position: Position;
      size: Size;
    };
    suggestions: {
      isOpen: boolean;
    };
  };

  // Tab state (from TabsContext)
  tabs: {
    activeTab: string;
    activeSubTabs: Record<string, string>;
    availableTabs: Array<{
      id: string;
      title: string;
      subTabs: Array<{ id: string; label: string }>;
    }>;
  };

  // Filter state (from FilterContext)
  filter: {
    path: string;
    suggestions: Suggestion[];
  };

  // Data state (from useDataProvider)
  data: {
    providers: Record<string, unknown>;
    loading: Record<string, boolean>;
    errors: Record<string, AppError | null>;
  };

  // UI preferences (persisted to localStorage)
  preferences: {
    popoverPosition: Position;
    popoverSize: Size;
  };
}

/**
 * Action types
 */
export type AppAction =
  // Popover actions
  | { type: 'POPOVER_TOGGLE'; payload: { id: 'main' | 'suggestions' } }
  | { type: 'POPOVER_OPEN'; payload: { id: 'main' | 'suggestions' } }
  | { type: 'POPOVER_CLOSE'; payload: { id: 'main' | 'suggestions' } }
  | { type: 'POPOVER_MOVE'; payload: { position: Position } }
  | { type: 'POPOVER_RESIZE'; payload: { size: Size } }
  
  // Tab actions
  | { type: 'TAB_SELECT'; payload: { tabId: string } }
  | { type: 'SUBTAB_SELECT'; payload: { tabId: string; subTabId: string } }
  | { type: 'TABS_INITIALIZE'; payload: { tabs: AppState['tabs']['availableTabs'] } }
  
  // Filter actions
  | { type: 'FILTER_SET_PATH'; payload: { path: string } }
  | { type: 'FILTER_SET_SUGGESTIONS'; payload: { suggestions: Suggestion[] } }
  | { type: 'FILTER_CLEAR' }
  
  // Data actions
  | { type: 'DATA_UPDATE'; payload: { providerId: string; data: unknown } }
  | { type: 'DATA_LOADING'; payload: { providerId: string } }
  | { type: 'DATA_ERROR'; payload: { providerId: string; error: AppError } }
  | { type: 'DATA_CLEAR'; payload: { providerId: string } }
  
  // Preferences actions
  | { type: 'PREFERENCES_UPDATE'; payload: Partial<AppState['preferences']> }
  | { type: 'PREFERENCES_RESET' }
  
  // Global actions
  | { type: 'RESET' };

// =============================================================================
// Initial State
// =============================================================================

const DEFAULT_POSITION: Position = { x: 100, y: 100 };
const DEFAULT_SIZE: Size = { width: 400, height: 500 };

const INITIAL_STATE: AppState = {
  popovers: {
    main: {
      isOpen: false,
      position: DEFAULT_POSITION,
      size: DEFAULT_SIZE,
    },
    suggestions: {
      isOpen: false,
    },
  },
  tabs: {
    activeTab: '',
    activeSubTabs: {},
    availableTabs: [],
  },
  filter: {
    path: '',
    suggestions: [],
  },
  data: {
    providers: {},
    loading: {},
    errors: {},
  },
  preferences: {
    popoverPosition: DEFAULT_POSITION,
    popoverSize: DEFAULT_SIZE,
  },
};

// =============================================================================
// Reducer
// =============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // -------------------------------------------------------------------------
    // Popover Actions
    // -------------------------------------------------------------------------
    case 'POPOVER_TOGGLE': {
      const { id } = action.payload;
      if (id === 'main') {
        const newIsOpen = !state.popovers.main.isOpen;
        return {
          ...state,
          popovers: {
            ...state.popovers,
            main: { ...state.popovers.main, isOpen: newIsOpen },
            // Close suggestions when main closes
            suggestions: newIsOpen ? state.popovers.suggestions : { isOpen: false },
          },
        };
      }
      return {
        ...state,
        popovers: {
          ...state.popovers,
          suggestions: { isOpen: !state.popovers.suggestions.isOpen },
        },
      };
    }

    case 'POPOVER_OPEN': {
      const { id } = action.payload;
      if (id === 'main') {
        return {
          ...state,
          popovers: {
            ...state.popovers,
            main: { ...state.popovers.main, isOpen: true },
          },
        };
      }
      return {
        ...state,
        popovers: {
          ...state.popovers,
          suggestions: { isOpen: true },
        },
      };
    }

    case 'POPOVER_CLOSE': {
      const { id } = action.payload;
      if (id === 'main') {
        return {
          ...state,
          popovers: {
            main: { ...state.popovers.main, isOpen: false },
            suggestions: { isOpen: false },
          },
        };
      }
      return {
        ...state,
        popovers: {
          ...state.popovers,
          suggestions: { isOpen: false },
        },
      };
    }

    case 'POPOVER_MOVE':
      return {
        ...state,
        popovers: {
          ...state.popovers,
          main: { ...state.popovers.main, position: action.payload.position },
        },
        preferences: {
          ...state.preferences,
          popoverPosition: action.payload.position,
        },
      };

    case 'POPOVER_RESIZE':
      return {
        ...state,
        popovers: {
          ...state.popovers,
          main: { ...state.popovers.main, size: action.payload.size },
        },
        preferences: {
          ...state.preferences,
          popoverSize: action.payload.size,
        },
      };

    // -------------------------------------------------------------------------
    // Tab Actions
    // -------------------------------------------------------------------------
    case 'TABS_INITIALIZE': {
      const tabs = action.payload.tabs;
      const firstTab = tabs[0];
      return {
        ...state,
        tabs: {
          availableTabs: tabs,
          activeTab: firstTab?.id ?? '',
          activeSubTabs: Object.fromEntries(
            tabs.map((tab) => [tab.id, tab.subTabs[0]?.id ?? ''])
          ),
        },
        filter: {
          path: '',
          suggestions: [],
        },
      };
    }

    case 'TAB_SELECT':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          activeTab: action.payload.tabId,
        },
        filter: {
          path: '',
          suggestions: [],
        },
      };

    case 'SUBTAB_SELECT':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          activeSubTabs: {
            ...state.tabs.activeSubTabs,
            [action.payload.tabId]: action.payload.subTabId,
          },
        },
      };

    // -------------------------------------------------------------------------
    // Filter Actions
    // -------------------------------------------------------------------------
    case 'FILTER_SET_PATH':
      return {
        ...state,
        filter: {
          ...state.filter,
          path: action.payload.path,
        },
      };

    case 'FILTER_SET_SUGGESTIONS':
      return {
        ...state,
        filter: {
          ...state.filter,
          suggestions: action.payload.suggestions,
        },
      };

    case 'FILTER_CLEAR':
      return {
        ...state,
        filter: {
          path: '',
          suggestions: [],
        },
      };

    // -------------------------------------------------------------------------
    // Data Actions
    // -------------------------------------------------------------------------
    case 'DATA_UPDATE':
      return {
        ...state,
        data: {
          ...state.data,
          providers: {
            ...state.data.providers,
            [action.payload.providerId]: action.payload.data,
          },
          loading: {
            ...state.data.loading,
            [action.payload.providerId]: false,
          },
          errors: {
            ...state.data.errors,
            [action.payload.providerId]: null,
          },
        },
      };

    case 'DATA_LOADING':
      return {
        ...state,
        data: {
          ...state.data,
          loading: {
            ...state.data.loading,
            [action.payload.providerId]: true,
          },
        },
      };

    case 'DATA_ERROR':
      return {
        ...state,
        data: {
          ...state.data,
          loading: {
            ...state.data.loading,
            [action.payload.providerId]: false,
          },
          errors: {
            ...state.data.errors,
            [action.payload.providerId]: action.payload.error,
          },
        },
      };

    case 'DATA_CLEAR':
      return {
        ...state,
        data: {
          ...state.data,
          providers: {
            ...state.data.providers,
            [action.payload.providerId]: null,
          },
          loading: {
            ...state.data.loading,
            [action.payload.providerId]: false,
          },
          errors: {
            ...state.data.errors,
            [action.payload.providerId]: null,
          },
        },
      };

    // -------------------------------------------------------------------------
    // Preferences Actions
    // -------------------------------------------------------------------------
    case 'PREFERENCES_UPDATE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case 'PREFERENCES_RESET':
      return {
        ...state,
        preferences: INITIAL_STATE.preferences,
      };

    // -------------------------------------------------------------------------
    // Global Actions
    // -------------------------------------------------------------------------
    case 'RESET':
      return INITIAL_STATE;

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<Dispatch<AppAction> | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

const STORAGE_KEY = 'dev-debug-tool-state';

/**
 * Load persisted preferences from localStorage
 */
function loadPersistedState(): Partial<AppState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        preferences: parsed.preferences ?? INITIAL_STATE.preferences,
        popovers: {
          ...INITIAL_STATE.popovers,
          main: {
            ...INITIAL_STATE.popovers.main,
            position: parsed.preferences?.popoverPosition ?? DEFAULT_POSITION,
            size: parsed.preferences?.popoverSize ?? DEFAULT_SIZE,
          },
        },
      };
    }
  } catch (e) {
    console.warn('[DevDebugTool] Failed to load persisted state:', e);
  }
  return {};
}

/**
 * Save preferences to localStorage
 */
function persistState(state: AppState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        preferences: state.preferences,
      })
    );
  } catch (e) {
    console.warn('[DevDebugTool] Failed to persist state:', e);
  }
}

export function AppProvider({ children }: PropsWithChildren) {
  // Load initial state with persisted preferences
  const initialState = useMemo(() => ({
    ...INITIAL_STATE,
    ...loadPersistedState(),
  }), []);

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist preferences when they change
  useEffect(() => {
    persistState(state);
  }, [state.preferences]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get the full app state
 */
export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

/**
 * Get the dispatch function
 */
export function useAppDispatch(): Dispatch<AppAction> {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}

// =============================================================================
// Selectors (for convenience)
// =============================================================================

/**
 * Select popover state
 */
export function usePopover(id: 'main' | 'suggestions') {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    isOpen: id === 'main' ? state.popovers.main.isOpen : state.popovers.suggestions.isOpen,
    position: id === 'main' ? state.popovers.main.position : undefined,
    size: id === 'main' ? state.popovers.main.size : undefined,
    toggle: () => dispatch({ type: 'POPOVER_TOGGLE', payload: { id } }),
    open: () => dispatch({ type: 'POPOVER_OPEN', payload: { id } }),
    close: () => dispatch({ type: 'POPOVER_CLOSE', payload: { id } }),
    move: (position: Position) => dispatch({ type: 'POPOVER_MOVE', payload: { position } }),
    resize: (size: Size) => dispatch({ type: 'POPOVER_RESIZE', payload: { size } }),
  }), [state.popovers, dispatch, id]);
}

/**
 * Select tabs state
 */
export function useTabs() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    tabs: state.tabs.availableTabs,
    activeTab: state.tabs.activeTab,
    activeSubTab: state.tabs.activeSubTabs[state.tabs.activeTab] ?? '',
    setTab: (tabId: string) => dispatch({ type: 'TAB_SELECT', payload: { tabId } }),
    setSubTab: (subTabId: string) => 
      dispatch({ 
        type: 'SUBTAB_SELECT', 
        payload: { tabId: state.tabs.activeTab, subTabId } 
      }),
    initialize: (tabs: AppState['tabs']['availableTabs']) =>
      dispatch({ type: 'TABS_INITIALIZE', payload: { tabs } }),
  }), [state.tabs, dispatch]);
}

/**
 * Select filter state
 */
export function useFilter() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    path: state.filter.path,
    suggestions: state.filter.suggestions,
    setPath: (path: string) => dispatch({ type: 'FILTER_SET_PATH', payload: { path } }),
    setSuggestions: (suggestions: Suggestion[]) => 
      dispatch({ type: 'FILTER_SET_SUGGESTIONS', payload: { suggestions } }),
    clear: () => dispatch({ type: 'FILTER_CLEAR' }),
  }), [state.filter, dispatch]);
}

/**
 * Select data for a specific provider
 */
export function useProviderData(providerId: string) {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    data: state.data.providers[providerId],
    loading: state.data.loading[providerId] ?? false,
    error: state.data.errors[providerId] ?? null,
    update: (data: unknown) => 
      dispatch({ type: 'DATA_UPDATE', payload: { providerId, data } }),
    setLoading: () => 
      dispatch({ type: 'DATA_LOADING', payload: { providerId } }),
    setError: (error: AppError) => 
      dispatch({ type: 'DATA_ERROR', payload: { providerId, error } }),
    clear: () => 
      dispatch({ type: 'DATA_CLEAR', payload: { providerId } }),
  }), [state.data, dispatch, providerId]);
}

/**
 * Select active provider data (based on current tab)
 */
export function useActiveProviderData() {
  const state = useAppState();
  const activeTab = state.tabs.activeTab;
  
  return useMemo(() => ({
    data: state.data.providers[activeTab],
    loading: state.data.loading[activeTab] ?? false,
    error: state.data.errors[activeTab] ?? null,
  }), [state.data, activeTab]);
}



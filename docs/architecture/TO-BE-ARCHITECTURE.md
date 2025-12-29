# Dev Debug Tool — To-Be Architecture

## Overview

This document describes the target architecture for the Dev Debug Tool plugin. The goal is to improve maintainability, testability, and reliability through incremental refactoring—**no big rewrites**.

---

## Architectural Principles

1. **Adapter Pattern** — Isolate external dependencies (Elementor, WordPress AJAX)
2. **Single Source of Truth** — Consolidated state management
3. **Fail Gracefully** — Error boundaries prevent full UI crashes
4. **Cache First** — Avoid redundant data extraction
5. **Type Safety** — Strict TypeScript throughout

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TO-BE ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                           ADAPTER LAYER (NEW)                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │  ElementorAdapter    │  │  WordPressAdapter    │                        │
│  │  - Wraps $e.commands │  │  - Wraps AJAX calls  │                        │
│  │  - Version detection │  │  - Error handling    │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           CORE LAYER (REFACTORED)                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │  DataProviderManager │  │  CacheManager (NEW)  │                        │
│  │  - Registry          │  │  - LRU cache         │                        │
│  │  - Lifecycle hooks   │  │  - TTL support       │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │  EventBus (NEW)      │  │  StateManager (NEW)  │                        │
│  │  - Typed events      │  │  - Persistence       │
│  │  - Replay support    │  │  - Hydration         │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           STATE LAYER (SIMPLIFIED)                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  AppContext (MERGED)                                                  │  │
│  │  - Replaces: PopoverContext, TabsContext, FilterContext, BoundsContext│  │
│  │  - Uses useReducer for predictable updates                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER (UNCHANGED)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
│      Popovers          Tabs           JSON Viewer                          │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Target File Structure

```
assets/js/
├── main.ts
├── App.tsx
├── Panel.tsx
├── popovers/
│   ├── MainPopover.tsx
│   └── SuggestionsPopover.tsx
│
└── core/
    ├── adapters/                    # NEW - External integrations
    │   ├── index.ts
    │   ├── elementor-adapter.ts     # Wraps $e.commands API
    │   ├── wordpress-adapter.ts     # Wraps AJAX calls
    │   └── types.ts                 # Adapter interfaces
    │
    ├── cache/                       # NEW - Caching layer
    │   ├── index.ts
    │   ├── cache-manager.ts         # LRU cache implementation
    │   └── types.ts
    │
    ├── state/                       # NEW - Consolidated state
    │   ├── index.ts
    │   ├── app-context.tsx          # Merged context
    │   ├── app-reducer.ts           # State reducer
    │   ├── actions.ts               # Action creators
    │   ├── selectors.ts             # State selectors
    │   ├── persistence.ts           # localStorage sync
    │   └── types.ts                 # State types
    │
    ├── errors/                      # NEW - Error handling
    │   ├── index.ts
    │   ├── error-boundary.tsx       # React error boundary
    │   └── error-reporter.ts        # Error logging
    │
    ├── events/                      # REFACTORED
    │   ├── event-bus.ts             # Typed event emitter
    │   ├── event-types.ts           # Event type definitions
    │   └── listeners/
    │
    ├── manager/                     # EXISTING (minor changes)
    │   ├── create-data-provider-manager.ts
    │   └── register-data-providers.ts
    │
    ├── providers/                   # EXISTING (uses adapters)
    │   ├── database-provider/
    │   └── editor-provider/
    │
    ├── hooks/                       # EXISTING + NEW
    │   ├── use-app-state.ts         # NEW - unified state hook
    │   └── ...existing hooks
    │
    └── components/                  # EXISTING
        └── ...
```

---

## Component Specifications

### 1. ElementorAdapter

**Purpose:** Isolate Elementor API dependencies for version safety and testability.

**Location:** `core/adapters/elementor-adapter.ts`

```typescript
// Interface
interface ElementorAdapter {
  // Event subscription
  onCommand(command: ElementorCommand, handler: () => void): Unsubscribe;
  onElementSelect(handler: (element: ElementorElement) => void): Unsubscribe;
  onElementDeselect(handler: () => void): Unsubscribe;
  onDocumentSave(handler: () => void): Unsubscribe;
  
  // Queries
  getSelectedElement(): ElementorElement | null;
  getDocumentId(): string;
  getKitId(): string;
  
  // Version info
  getVersion(): string;
  isCompatible(): boolean;
}

// Supported commands (typed)
type ElementorCommand = 
  | 'document/elements/select'
  | 'document/elements/deselect'
  | 'document/elements/delete'
  | 'document/save/update'
  | 'panel/exit';
```

**Implementation Notes:**
- Wraps `$e.commands.on('run:after', ...)` 
- Detects Elementor version for compatibility
- Provides fallback behavior for older versions
- Single point of failure for Elementor API changes

---

### 2. WordPressAdapter

**Purpose:** Abstract WordPress AJAX calls with proper error handling.

**Location:** `core/adapters/wordpress-adapter.ts`

```typescript
interface WordPressAdapter {
  fetch<T>(action: string, data: Record<string, unknown>): Promise<Result<T>>;
  getNonce(): string;
  getAjaxUrl(): string;
}

// Result type for error handling
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

interface AppError {
  code: 'NETWORK' | 'AUTH' | 'VALIDATION' | 'SERVER';
  message: string;
  details?: unknown;
}
```

---

### 3. CacheManager

**Purpose:** Prevent redundant data extraction and API calls.

**Location:** `core/cache/cache-manager.ts`

```typescript
interface CacheManager<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  invalidate(key: string): void;
  invalidateAll(): void;
  
  // Stats for debugging
  getStats(): { hits: number; misses: number; size: number };
}

// Factory
function createCacheManager<T>(options: {
  maxSize?: number;      // Default: 100
  defaultTTL?: number;   // Default: 5 minutes
}): CacheManager<T>;
```

**Use Cases:**
- Cache extracted element data by element ID
- Cache database responses by post ID + meta key
- Invalidate on save events

---

### 4. AppContext (Merged State)

**Purpose:** Single source of truth replacing 4 separate contexts.

**Location:** `core/state/app-context.tsx`

```typescript
// State shape
interface AppState {
  // Popover state (from PopoverContext)
  popovers: {
    main: { isOpen: boolean; position: Position; size: Size };
    suggestions: { isOpen: boolean };
  };
  
  // Tab state (from TabsContext)
  tabs: {
    activeTab: string;
    activeSubTabs: Record<string, string>;
  };
  
  // Filter state (from FilterContext)
  filter: {
    path: string;
    suggestions: Suggestion[];
  };
  
  // Data state
  data: {
    providers: Record<string, unknown>;
    loading: Record<string, boolean>;
    errors: Record<string, AppError | null>;
  };
  
  // UI preferences (persisted)
  preferences: {
    popoverPosition: Position;
    popoverSize: Size;
  };
}

// Actions
type AppAction =
  | { type: 'POPOVER_TOGGLE'; payload: { id: string } }
  | { type: 'POPOVER_MOVE'; payload: { position: Position } }
  | { type: 'TAB_SELECT'; payload: { tabId: string } }
  | { type: 'SUBTAB_SELECT'; payload: { subTabId: string } }
  | { type: 'FILTER_SET_PATH'; payload: { path: string } }
  | { type: 'DATA_UPDATE'; payload: { providerId: string; data: unknown } }
  | { type: 'DATA_LOADING'; payload: { providerId: string } }
  | { type: 'DATA_ERROR'; payload: { providerId: string; error: AppError } }
  | { type: 'PREFERENCES_UPDATE'; payload: Partial<AppState['preferences']> };
```

---

### 5. ErrorBoundary

**Purpose:** Graceful error handling for React component tree.

**Location:** `core/errors/error-boundary.tsx`

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Usage in App.tsx
<ErrorBoundary 
  fallback={<ErrorFallbackUI />}
  onError={(error) => console.error('[DevDebug]', error)}
>
  <Panel />
</ErrorBoundary>
```

---

### 6. EventBus (Typed)

**Purpose:** Replace loose custom events with typed event system.

**Location:** `core/events/event-bus.ts`

```typescript
// Event definitions
interface EventMap {
  'element:selected': { elementId: string; data: unknown };
  'element:deselected': void;
  'data:updated': { providerId: string; data: unknown };
  'data:loading': { providerId: string };
  'popover:opened': { popoverId: string };
  'popover:closed': { popoverId: string };
  'tab:changed': { tabId: string; subTabId?: string };
}

interface EventBus {
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): Unsubscribe;
  once<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void;
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TO-BE FLOW: Element Selection → JSON Display                               │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: User clicks element
         │
         ▼
┌─────────────────────────────────────────┐
│ ElementorAdapter.onElementSelect()      │
│  - Version check                        │
│  - Fallback for older Elementor         │
└────────────────────┬────────────────────┘
                     │
Step 2:              ▼
┌─────────────────────────────────────────┐
│ CacheManager.get(elementId)             │
│  ├─ HIT → Return cached data            │
│  └─ MISS → Continue to extraction       │
└────────────────────┬────────────────────┘
                     │
Step 3:              ▼
┌─────────────────────────────────────────┐
│ EditorProvider.extractData()            │
│  - Extract element data                 │
│  - Store in CacheManager                │
└────────────────────┬────────────────────┘
                     │
Step 4:              ▼
┌─────────────────────────────────────────┐
│ EventBus.emit('data:updated')           │
│  - Typed event                          │
│  - Triggers state update                │
└────────────────────┬────────────────────┘
                     │
Step 5:              ▼
┌─────────────────────────────────────────┐
│ AppContext reducer                      │
│  - Updates data.providers[editor]       │
│  - Clears loading state                 │
└────────────────────┬────────────────────┘
                     │
Step 6:              ▼
┌─────────────────────────────────────────┐
│ ErrorBoundary wraps UI                  │
│  - Catches render errors                │
│  - Shows fallback UI                    │
└────────────────────┬────────────────────┘
                     │
Step 7:              ▼
┌─────────────────────────────────────────┐
│ TabPanel renders JSON                   │
│  - Uses cached/memoized data            │
│  - JsonSyntaxHighlighter                │
└─────────────────────────────────────────┘
```

---

## Benefits Summary

| Improvement | Benefit |
|-------------|---------|
| **ElementorAdapter** | Single point of failure for API changes; easier to mock in tests |
| **WordPressAdapter** | Consistent error handling; retry logic in one place |
| **CacheManager** | 50%+ reduction in redundant data extraction |
| **AppContext (merged)** | Fewer re-renders; simpler mental model |
| **ErrorBoundary** | No more full UI crashes on React errors |
| **Typed EventBus** | Compile-time event type checking |
| **State persistence** | Better UX—settings survive page refresh |

---

## See Also

- [Migration Plan](./MIGRATION-PLAN.md)
- [As-Is Architecture](./AS-IS-ARCHITECTURE.md)
- [Component Diagrams](./diagrams/)



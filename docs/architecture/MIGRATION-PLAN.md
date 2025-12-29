# Dev Debug Tool — Migration Plan

## Overview

This document outlines the step-by-step migration from the current (As-Is) architecture to the target (To-Be) architecture. Each step is designed to be:

- **Small** — Completable in 1-3 days
- **Safe** — Low risk of breaking existing functionality
- **Incremental** — Each step provides standalone value

---

## Migration Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MIGRATION TIMELINE                                │
└─────────────────────────────────────────────────────────────────────────────┘

Week 1                Week 2-3              Month 1               Month 2+
─────────────────────────────────────────────────────────────────────────────►

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PHASE 1    │    │   PHASE 2    │    │   PHASE 3    │    │   PHASE 4    │
│   Cleanup    │───►│  Boundaries  │───►│ Performance  │───►│ Enhancement  │
│              │    │              │    │              │    │              │
│ - Dead code  │    │ - Adapters   │    │ - Caching    │    │ - Web Worker │
│ - Error      │    │ - Merge      │    │ - Memoization│    │ - Persistence│
│   boundary   │    │   contexts   │    │ - Strict TS  │    │ - Testing    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## Phase 1: Cleanup (Week 1)

### Step 1.1: Remove Dead Code

**Priority:** High  
**Effort:** 2-4 hours  
**Risk:** Low

**What to do:**
1. Delete all commented-out code blocks in:
   - `core/hooks/use-data-provider.ts` (150+ lines of comments)
   - `popovers/MainPopover.tsx` (commented JSX at end)
   - Any other files with extensive dead code

2. Remove unused imports across all files

3. Delete unused files (if any)

**Verification:**
```bash
npm run build  # Should complete without errors
```

**Why:**
- Commented code creates cognitive overhead
- Makes actual implementation harder to understand
- No functional change, pure cleanup

---

### Step 1.2: Add ErrorBoundary

**Priority:** High  
**Effort:** 2-4 hours  
**Risk:** Low

**Create:** `core/errors/error-boundary.tsx`

```typescript
import * as React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DevDebugTool] Error caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="dev-debug-error">
          <h3>Something went wrong</h3>
          <p>The debug panel encountered an error.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Update:** `Panel.tsx`

```typescript
import { ErrorBoundary } from '@app/errors/error-boundary';

export const Panel = () => {
  // ... existing code ...

  return (
    <ErrorBoundary>
      <TabsProvider>
        <FilterProvider>
          <MainPopover ref={mainPopoverRef} />
          <SuggestionsPopover anchorRef={mainPopoverRef} />
        </FilterProvider>
      </TabsProvider>
    </ErrorBoundary>
  );
};
```

**Why:**
- Currently, any React error crashes the entire debug panel
- Users see blank screen with no way to recover
- Error boundary provides graceful degradation

---

### Step 1.3: Add Basic TypeScript Strictness

**Priority:** Medium  
**Effort:** 4-8 hours  
**Risk:** Low-Medium

**Update:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    // ... existing options
  }
}
```

**Then fix type errors:**
- Replace `any` with proper types
- Add null checks where needed
- Create interfaces for Elementor types

**Priority files to fix:**
1. `core/types.ts` — Core type definitions
2. `core/providers/editor-provider/provider.ts`
3. `core/providers/database-provider/provider.ts`

**Why:**
- Heavy use of `any` hides bugs
- Strict mode catches issues at compile time
- Improves IDE autocomplete and documentation

---

## Phase 2: Boundaries (Week 2-3)

### Step 2.1: Create ElementorAdapter

**Priority:** High  
**Effort:** 1-2 days  
**Risk:** Medium

**Create:** `core/adapters/elementor-adapter.ts`

```typescript
import { getElementorCommands } from '@app/sync/get-elementor-commands';
import { getSelectedElement } from '@app/sync/get-selected-element';

export type ElementorCommand =
  | 'document/elements/select'
  | 'document/elements/deselect'
  | 'document/elements/deselect-all'
  | 'document/elements/delete'
  | 'document/save/update'
  | 'panel/exit';

export interface ElementorAdapter {
  onCommand(commands: ElementorCommand | ElementorCommand[], handler: () => void): () => void;
  getSelectedElement(): ReturnType<typeof getSelectedElement>;
  getVersion(): string;
  isAvailable(): boolean;
}

export function createElementorAdapter(): ElementorAdapter {
  const commands = getElementorCommands();

  const onCommand = (
    commandList: ElementorCommand | ElementorCommand[],
    handler: () => void
  ) => {
    const toWatch = Array.isArray(commandList) ? commandList : [commandList];

    const internalHandler = (_: unknown, command: string) => {
      if (toWatch.includes(command as ElementorCommand)) {
        handler();
      }
    };

    commands.on('run:after', internalHandler);

    return () => {
      commands.off('run:after', internalHandler);
    };
  };

  return {
    onCommand,
    getSelectedElement,
    getVersion: () => window.elementor?.config?.version ?? 'unknown',
    isAvailable: () => typeof window.elementor !== 'undefined',
  };
}

// Singleton instance
export const elementorAdapter = createElementorAdapter();
```

**Update providers to use adapter:**

```typescript
// Before (in local-mode.ts)
import { listenToElementorEvent } from '@app/events/listeners/listen-to-elementor-event';

// After
import { elementorAdapter } from '@app/adapters/elementor-adapter';

// Usage
elementorAdapter.onCommand('document/elements/select', subscribeToElement);
```

**Why:**
- Single point of contact with Elementor API
- Version detection for compatibility
- Easier to mock in tests
- When Elementor changes API, only one file needs updating

---

### Step 2.2: Create WordPressAdapter

**Priority:** Medium  
**Effort:** 4-8 hours  
**Risk:** Low

**Create:** `core/adapters/wordpress-adapter.ts`

```typescript
import { getSettings } from '@app/sync/get-settings';

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export interface WordPressAdapter {
  fetch<T>(action: string, data: Record<string, string>): Promise<Result<T>>;
}

export function createWordPressAdapter(): WordPressAdapter {
  const { baseUrl, nonce } = getSettings();

  const fetch = async <T>(
    action: string,
    data: Record<string, string>
  ): Promise<Result<T>> => {
    try {
      const params = new URLSearchParams({
        action,
        nonce,
        ...data,
      });

      const response = await window.fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        return {
          success: false,
          error: { code: 'HTTP_ERROR', message: `HTTP ${response.status}` },
        };
      }

      const json = await response.json();

      if (json.success) {
        return { success: true, data: json.data as T };
      }

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: json.data?.message ?? 'Unknown error',
        },
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Network error',
        },
      };
    }
  };

  return { fetch };
}

export const wordpressAdapter = createWordPressAdapter();
```

**Why:**
- Consistent error handling across all AJAX calls
- Type-safe responses
- Easy to add retry logic, request deduplication later

---

### Step 2.3: Merge Contexts into AppContext

**Priority:** Medium  
**Effort:** 2-3 days  
**Risk:** Medium

**Create:** `core/state/app-context.tsx`

This is the largest refactor. Create the new context first, then migrate components one at a time.

**Migration strategy:**
1. Create `AppContext` with reducer
2. Keep old contexts working
3. Migrate one component at a time to use `useAppState()`
4. Delete old contexts when all components migrated

**See:** `TO-BE-ARCHITECTURE.md` for full AppContext specification.

**Why:**
- 4 nested contexts create re-render overhead
- Hard to understand state flow
- Single reducer is more predictable and debuggable

---

## Phase 3: Performance (Month 1)

### Step 3.1: Add CacheManager

**Priority:** Medium  
**Effort:** 1 day  
**Risk:** Low

**Create:** `core/cache/cache-manager.ts`

```typescript
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export function createCacheManager<T>(options: {
  maxSize?: number;
  defaultTTL?: number;
} = {}) {
  const { maxSize = 100, defaultTTL = 5 * 60 * 1000 } = options;
  const cache = new Map<string, CacheEntry<T>>();
  let hits = 0;
  let misses = 0;

  const get = (key: string): T | undefined => {
    const entry = cache.get(key);
    
    if (!entry) {
      misses++;
      return undefined;
    }
    
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      misses++;
      return undefined;
    }
    
    hits++;
    return entry.value;
  };

  const set = (key: string, value: T, ttl = defaultTTL) => {
    // LRU eviction
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  };

  const invalidate = (key: string) => cache.delete(key);
  const invalidateAll = () => cache.clear();
  const has = (key: string) => get(key) !== undefined;
  const getStats = () => ({ hits, misses, size: cache.size });

  return { get, set, has, invalidate, invalidateAll, getStats };
}
```

**Integrate with EditorProvider:**

```typescript
const elementCache = createCacheManager<ExtractedData>({ maxSize: 50 });

// In localMode
const notifyElement = (element: MarionetteElement | null) => {
  if (!element) {
    notify(null);
    return;
  }

  const cacheKey = element.id ?? element.cid;
  const cached = elementCache.get(cacheKey);
  
  if (cached) {
    notify(cached);
    return;
  }

  const extracted = dataExtractor.extract(element);
  elementCache.set(cacheKey, extracted);
  notify(extracted);
};
```

**Why:**
- Same element selected twice extracts data twice (redundant)
- Cache hit avoids expensive extraction
- Invalidate on save events

---

### Step 3.2: Add Memoization to Components

**Priority:** Medium  
**Effort:** 4-8 hours  
**Risk:** Low

**Target components:**
- `TabPanel` — Memoize JSON stringification
- `JsonSyntaxHighlighter` — Use `React.memo()`
- `Suggestions` — Memoize filtered list

**Example:**

```typescript
// Before
export const JsonSyntaxHighlighter = ({ content }: { content: any }) => {
  const stringJson = JSON.stringify(content, null, 2);
  // ...
};

// After
export const JsonSyntaxHighlighter = React.memo(({ content }: { content: any }) => {
  const stringJson = useMemo(
    () => JSON.stringify(content, null, 2),
    [content]
  );
  // ...
});
```

**Why:**
- Prevents unnecessary re-renders
- JSON.stringify is expensive for large data

---

## Phase 4: Enhancement (Month 2+)

### Step 4.1: Web Worker for JSON Processing

**Priority:** Low  
**Effort:** 2-3 days  
**Risk:** Medium

For large Elementor data (>100KB), move JSON stringification to a web worker.

### Step 4.2: State Persistence

**Priority:** Low  
**Effort:** 1 day  
**Risk:** Low

Save popover position/size to localStorage. Restore on page load.

### Step 4.3: Integration Tests

**Priority:** Medium  
**Effort:** 3-5 days  
**Risk:** Low

Add tests for critical flows using Jest + React Testing Library.

---

## Verification Checklist

After each phase, verify:

- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts without errors
- [ ] Plugin activates without errors
- [ ] Debug panel opens/closes correctly
- [ ] Element selection shows JSON data
- [ ] Tab switching works
- [ ] Database fetch works after save
- [ ] No console errors

---

## Rollback Strategy

Each step should be in a separate Git commit. If issues arise:

```bash
# Revert last commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
```

Keep the main branch stable. Use feature branches for each migration step.

---

## See Also

- [To-Be Architecture](./TO-BE-ARCHITECTURE.md)
- [As-Is Architecture](./AS-IS-ARCHITECTURE.md)



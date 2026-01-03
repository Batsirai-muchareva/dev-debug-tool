# Style Schema Architecture

## Problem Statement

The style schema from `elementor.config.atomic.styles_schema` is massive:
- Hundreds/thousands of keys
- Each key maps to a complex nested object
- Loading all data into the DOM causes performance issues
- Current implementation dumps all keys, then loads details on click

## Current Issues

```typescript
// Current: Loads ALL keys into DOM at once
const schema = elementorAdapter.getStyleSchema();
const keys = Object.keys(schema);
notify(keys); // All keys rendered as JSON

// On click: Loads individual schema
eventBus.on('style-schema:clicked', ({ line: index }) => {
  notify(schema[keys[index]]); // Now shows one schema
});
```

**Problems:**
1. All keys rendered as JSON → thousands of DOM nodes
2. Line click maps to index → fragile, depends on JSON stringify
3. Navigation is one-way (can't go back to list)
4. Mixed concerns in Scrollable component
5. No lazy loading or virtualization

---

## Clean Architecture Solution

### Key Principles

1. **Virtualization** — Only render visible items
2. **Lazy Loading** — Load schema details on demand
3. **Clear Navigation** — List → Detail with back navigation
4. **Separation of Concerns** — Schema logic separate from generic components

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SCHEMA VIEWER                                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ DATA LAYER (Adapter)                                                  │
│                                                                       │
│  SchemaAdapter                                                        │
│  ├─ getKeys(): string[]         Get all schema keys (metadata only)  │
│  ├─ getSchema(key): Schema      Get single schema by key             │
│  └─ searchKeys(query): string[] Filter keys by search term           │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STATE LAYER (Context/Hook)                                            │
│                                                                       │
│  useSchemaNavigation()                                                │
│  ├─ view: 'list' | 'detail'     Current view mode                    │
│  ├─ selectedKey: string | null  Currently selected schema key        │
│  ├─ selectKey(key)              Navigate to detail view              │
│  └─ goBack()                    Navigate back to list                │
│                                                                       │
│  useSchemaSearch()                                                    │
│  ├─ query: string               Search query                         │
│  ├─ setQuery(q)                 Update search                        │
│  └─ filteredKeys: string[]      Filtered key list                    │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│ UI LAYER (Components)                                                 │
│                                                                       │
│  <SchemaViewer />               Orchestrator                          │
│  ├─ <SchemaList />              Virtualized list of keys             │
│  │   └─ <VirtualList />         Only renders visible items           │
│  │       └─ <SchemaListItem />  Single clickable key                 │
│  │                                                                    │
│  └─ <SchemaDetail />            Shows selected schema                │
│      ├─ <BackButton />          Navigate back                        │
│      └─ <JsonViewer />          Existing JSON viewer                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
core/
├── adapters/
│   └── elementor/
│       └── schema/
│           ├── schema-adapter.ts      # Data access layer
│           └── types.ts               # Schema types
│
├── providers/
│   └── schema/
│       ├── context/
│       │   ├── schema-context.tsx     # Navigation state
│       │   └── schema-search-context.tsx
│       ├── hooks/
│       │   ├── use-schema-keys.ts     # Get all keys
│       │   └── use-schema-detail.ts   # Get single schema
│       └── types.ts
│
├── components/
│   └── schema-viewer/
│       ├── schema-viewer.tsx          # Main orchestrator
│       ├── schema-list.tsx            # Virtualized list
│       ├── schema-list-item.tsx       # Single item
│       ├── schema-detail.tsx          # Detail view
│       └── schema-search.tsx          # Search input
│
└── libs/
    └── virtual-list/
        ├── virtual-list.tsx           # Generic virtualization
        └── use-virtual-scroll.ts      # Virtualization hook
```

---

## Implementation

### 1. Schema Adapter

```typescript
// adapters/elementor/schema/schema-adapter.ts

interface StyleSchema {
  [key: string]: unknown;
}

interface SchemaAdapter {
  /** Get all schema keys (just the keys, not the data) */
  getKeys(): string[];
  
  /** Get schema for a specific key */
  getSchema(key: string): unknown | null;
  
  /** Search keys by query */
  searchKeys(query: string): string[];
  
  /** Get total count */
  getCount(): number;
}

const createSchemaAdapter = (): SchemaAdapter => {
  // Cache the schema reference (don't copy the data)
  let schemaRef: StyleSchema | null = null;
  let keysCache: string[] | null = null;

  const getSchemaRef = (): StyleSchema => {
    if (!schemaRef) {
      schemaRef = (window as any).elementor?.config?.atomic?.styles_schema ?? {};
    }
    return schemaRef;
  };

  const getKeysCache = (): string[] => {
    if (!keysCache) {
      keysCache = Object.keys(getSchemaRef());
    }
    return keysCache;
  };

  return {
    getKeys: () => getKeysCache(),

    getSchema: (key: string) => {
      const schema = getSchemaRef();
      return schema[key] ?? null;
    },

    searchKeys: (query: string) => {
      if (!query.trim()) {
        return getKeysCache();
      }
      
      const lowerQuery = query.toLowerCase();
      return getKeysCache().filter((key) =>
        key.toLowerCase().includes(lowerQuery)
      );
    },

    getCount: () => getKeysCache().length,
  };
};

export const schemaAdapter = createSchemaAdapter();
```

### 2. Virtual List Component

```typescript
// libs/virtual-list/virtual-list.tsx

import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';

interface VirtualListProps<T> {
  /** All items (just references, not rendered) */
  items: T[];
  
  /** Height of each item in pixels */
  itemHeight: number;
  
  /** Height of the container */
  containerHeight: number;
  
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /** Number of items to render outside viewport (buffer) */
  overscan?: number;
  
  /** Key extractor */
  getKey?: (item: T, index: number) => string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  getKey = (_, i) => String(i),
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount);

  // Only render visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Rendered items positioned absolutely */}
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) => (
            <div
              key={getKey(item, startIndex + i)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3. Schema Context (Navigation State)

```typescript
// providers/schema/context/schema-context.tsx

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type View = 'list' | 'detail';

interface SchemaNavigationState {
  view: View;
  selectedKey: string | null;
  selectKey: (key: string) => void;
  goBack: () => void;
}

const SchemaNavigationContext = createContext<SchemaNavigationState | null>(null);

export const SchemaNavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [view, setView] = useState<View>('list');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectKey = useCallback((key: string) => {
    setSelectedKey(key);
    setView('detail');
  }, []);

  const goBack = useCallback(() => {
    setSelectedKey(null);
    setView('list');
  }, []);

  const value = useMemo(
    () => ({ view, selectedKey, selectKey, goBack }),
    [view, selectedKey, selectKey, goBack]
  );

  return (
    <SchemaNavigationContext.Provider value={value}>
      {children}
    </SchemaNavigationContext.Provider>
  );
};

export const useSchemaNavigation = () => {
  const ctx = useContext(SchemaNavigationContext);
  if (!ctx) {
    throw new Error('useSchemaNavigation must be used within SchemaNavigationProvider');
  }
  return ctx;
};
```

### 4. Schema Search Context

```typescript
// providers/schema/context/schema-search-context.tsx

import React, { createContext, useContext, useState, useMemo } from 'react';
import { schemaAdapter } from '@app/adapters/elementor/schema/schema-adapter';

interface SchemaSearchState {
  query: string;
  setQuery: (q: string) => void;
  filteredKeys: string[];
  totalCount: number;
}

const SchemaSearchContext = createContext<SchemaSearchState | null>(null);

export const SchemaSearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useState('');

  const filteredKeys = useMemo(
    () => schemaAdapter.searchKeys(query),
    [query]
  );

  const totalCount = schemaAdapter.getCount();

  const value = useMemo(
    () => ({ query, setQuery, filteredKeys, totalCount }),
    [query, filteredKeys, totalCount]
  );

  return (
    <SchemaSearchContext.Provider value={value}>
      {children}
    </SchemaSearchContext.Provider>
  );
};

export const useSchemaSearch = () => {
  const ctx = useContext(SchemaSearchContext);
  if (!ctx) {
    throw new Error('useSchemaSearch must be used within SchemaSearchProvider');
  }
  return ctx;
};
```

### 5. Schema Viewer (Orchestrator)

```typescript
// components/schema-viewer/schema-viewer.tsx

import React from 'react';
import { SchemaNavigationProvider, useSchemaNavigation } from '@app/providers/schema/context/schema-context';
import { SchemaSearchProvider } from '@app/providers/schema/context/schema-search-context';
import { SchemaList } from './schema-list';
import { SchemaDetail } from './schema-detail';

const SchemaViewerInner: React.FC = () => {
  const { view } = useSchemaNavigation();

  return view === 'list' ? <SchemaList /> : <SchemaDetail />;
};

export const SchemaViewer: React.FC = () => {
  return (
    <SchemaNavigationProvider>
      <SchemaSearchProvider>
        <SchemaViewerInner />
      </SchemaSearchProvider>
    </SchemaNavigationProvider>
  );
};
```

### 6. Schema List (Virtualized)

```typescript
// components/schema-viewer/schema-list.tsx

import React from 'react';
import { VirtualList } from '@libs/virtual-list/virtual-list';
import { useSchemaSearch } from '@app/providers/schema/context/schema-search-context';
import { useSchemaNavigation } from '@app/providers/schema/context/schema-context';
import { useBounds } from '@app/context/bounds-context';
import { SchemaSearch } from './schema-search';
import { SchemaListItem } from './schema-list-item';

const ITEM_HEIGHT = 32; // Height of each list item

export const SchemaList: React.FC = () => {
  const { filteredKeys, totalCount } = useSchemaSearch();
  const { selectKey } = useSchemaNavigation();
  const { size } = useBounds();

  const containerHeight = size.height - 220; // Account for header, search, etc.

  return (
    <div className="schema-list">
      <SchemaSearch />
      
      <div className="schema-list__header">
        {filteredKeys.length} of {totalCount} schemas
      </div>

      <VirtualList
        items={filteredKeys}
        itemHeight={ITEM_HEIGHT}
        containerHeight={containerHeight}
        getKey={(key) => key}
        renderItem={(key, index) => (
          <SchemaListItem
            schemaKey={key}
            index={index}
            onClick={() => selectKey(key)}
          />
        )}
      />
    </div>
  );
};
```

### 7. Schema List Item

```typescript
// components/schema-viewer/schema-list-item.tsx

import React, { memo } from 'react';

interface Props {
  schemaKey: string;
  index: number;
  onClick: () => void;
}

export const SchemaListItem = memo<Props>(({ schemaKey, index, onClick }) => {
  return (
    <button
      className="schema-list-item"
      onClick={onClick}
      type="button"
    >
      <span className="schema-list-item__index">{index + 1}</span>
      <span className="schema-list-item__key">{schemaKey}</span>
      <span className="schema-list-item__arrow">→</span>
    </button>
  );
});

SchemaListItem.displayName = 'SchemaListItem';
```

### 8. Schema Detail

```typescript
// components/schema-viewer/schema-detail.tsx

import React, { useMemo } from 'react';
import { useSchemaNavigation } from '@app/providers/schema/context/schema-context';
import { schemaAdapter } from '@app/adapters/elementor/schema/schema-adapter';
import { Scrollable } from '@component/scrollable';
import { JsonSyntax } from '@component/json-viewer/json-syntax';

export const SchemaDetail: React.FC = () => {
  const { selectedKey, goBack } = useSchemaNavigation();

  // Load schema data only when viewing detail
  const schemaData = useMemo(() => {
    if (!selectedKey) return null;
    return schemaAdapter.getSchema(selectedKey);
  }, [selectedKey]);

  if (!selectedKey || !schemaData) {
    return null;
  }

  return (
    <div className="schema-detail">
      <div className="schema-detail__header">
        <button 
          className="schema-detail__back"
          onClick={goBack}
          type="button"
        >
          ← Back
        </button>
        <h3 className="schema-detail__title">{selectedKey}</h3>
      </div>

      <Scrollable>
        {/* Option 1: Use FilterContext integration */}
        <JsonSyntaxWithData data={schemaData} />
        
        {/* Option 2: Direct rendering */}
        {/* <JsonSyntax content={schemaData} /> */}
      </Scrollable>
    </div>
  );
};

// Helper to render JSON with data prop
const JsonSyntaxWithData: React.FC<{ data: unknown }> = ({ data }) => {
  const stringJson = JSON.stringify(data, null, 2);

  // Render using syntax highlighter
  // ...
};
```

### 9. Schema Search

```typescript
// components/schema-viewer/schema-search.tsx

import React from 'react';
import { useSchemaSearch } from '@app/providers/schema/context/schema-search-context';

export const SchemaSearch: React.FC = () => {
  const { query, setQuery } = useSchemaSearch();

  return (
    <div className="schema-search">
      <input
        type="text"
        className="schema-search__input"
        placeholder="Search schemas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          className="schema-search__clear"
          onClick={() => setQuery('')}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};
```

---

## CSS Styling

```scss
// _schema-viewer.scss

.schema-list {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    padding: 8px 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.schema-list-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #e0e0e0;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }

  &__index {
    width: 40px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    font-family: monospace;
  }

  &__key {
    flex: 1;
    font-family: monospace;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover &__arrow {
    opacity: 0.5;
  }
}

.schema-detail {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__back {
    padding: 4px 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: transparent;
    color: #e0e0e0;
    cursor: pointer;
    font-size: 12px;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__title {
    margin: 0;
    font-size: 14px;
    font-family: monospace;
    color: #ffd500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.schema-search {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &__input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.3);
    color: #e0e0e0;
    font-size: 13px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    &:focus {
      outline: none;
      border-color: #ffd500;
    }
  }

  &__clear {
    margin-left: 8px;
    padding: 4px 8px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }
}
```

---

## Key Benefits

| Before | After |
|--------|-------|
| All keys rendered as JSON (thousands of DOM nodes) | Only ~20 visible items rendered |
| Click maps to line index (fragile) | Click on actual item (reliable) |
| No search | Full text search on keys |
| No back navigation | Clear list → detail → back flow |
| Schema logic in Scrollable | Clean separation of concerns |
| Full JSON stringification | Only stringify on detail view |

---

## Performance Comparison

| Metric | Before | After |
|--------|--------|-------|
| Initial DOM nodes | ~10,000+ | ~50 |
| Initial render time | ~500ms+ | ~20ms |
| Memory usage | High (all JSON in memory) | Low (lazy load) |
| Scroll performance | Janky | Smooth (virtualized) |
| Search | None | Instant (keys only) |

---

## Integration with Existing Code

### Update Data Source

```typescript
// providers/schema/sources/style-schema-source.ts

import { DataSourceFactory, Notify } from "@app/types";

// NEW: Use view-based approach instead of raw data
interface SchemaViewState {
  view: 'list' | 'detail';
  keys: string[];
  selectedKey: string | null;
  selectedSchema: unknown | null;
}

export const createStyleSchemaSource: DataSourceFactory<SchemaViewState> = () => {
  let notify: Notify<SchemaViewState> | null = null;
  
  // Don't load data here - let the component handle it
  return {
    start(notifyFn) {
      notify = notifyFn;
      
      // Just signal that we're ready
      notify({
        view: 'list',
        keys: [], // Keys loaded by component via adapter
        selectedKey: null,
        selectedSchema: null,
      });
    },
    stop() {
      notify = null;
    },
  };
};
```

### Or: Remove Data Source Entirely

Since the schema is static (doesn't change), you might not need a data source at all:

```typescript
// components/schema-viewer/schema-viewer.tsx

// Just use the adapter directly - no data source needed
// The schema is already in memory via elementor.config
```

---

## Summary

**Where things live:**

| What | Where | Why |
|------|-------|-----|
| Schema data access | `adapters/elementor/schema/schema-adapter.ts` | Abstracts Elementor global |
| Navigation state | `providers/schema/context/schema-context.tsx` | React state management |
| Search state | `providers/schema/context/schema-search-context.tsx` | React state management |
| Virtual list | `libs/virtual-list/virtual-list.tsx` | Reusable, generic |
| Schema UI | `components/schema-viewer/*` | Feature-specific components |

**Key principles:**
1. **Don't stringify what you don't show** — Only JSON.stringify the selected schema
2. **Virtualize long lists** — Only render visible items
3. **Lazy load details** — Load schema data only when user clicks
4. **Clear navigation** — List → Detail with back button
5. **Search on metadata** — Search keys, not content

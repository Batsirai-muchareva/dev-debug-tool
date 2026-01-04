# Unified Data Sources Architecture

## Problem Statement

Currently, the system has **special-case handling** for different data sources:

```
┌─────────────────────────────────────────────────────────────┐
│ CURRENT: Special Cases                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Editor Provider ──► JsonViewer (renders all)                │
│  Database Provider ──► JsonViewer (renders all)              │
│  Schema Provider ──► SchemaBrowser (special lib!)  ◄── BAD   │
│                                                              │
│  The system "knows" schema is special and needs different    │
│  treatment. This breaks uniformity.                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Problems:**
1. `ActiveTabContent` has `if (activeTab === 'schema')` — hardcoded special case
2. Schema has its own library, others don't
3. Adding a new "large" source requires new special handling
4. Infrastructure is not source-agnostic

---

## Proposed: Unified Source Architecture

The infrastructure should handle **any source** without knowing its specifics. Sources declare their **capabilities and preferences**, and the infrastructure adapts.

```
┌─────────────────────────────────────────────────────────────┐
│ PROPOSED: Source-Agnostic Infrastructure                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Any Source ──► Infrastructure ──► Appropriate Renderer      │
│                                                              │
│  Sources declare:                                            │
│    • Data type (object, array, key-value-store)              │
│    • Rendering strategy (json, virtualized, custom)          │
│    • Size hint (small, large, streaming)                     │
│                                                              │
│  Infrastructure:                                             │
│    • Routes to appropriate renderer                          │
│    • Applies optimizations based on hints                    │
│    • No source-specific code                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. Source Capabilities

Every data source declares its **capabilities** — what it can do and how it should be rendered:

```typescript
interface SourceCapabilities {
    /**
     * Data structure type
     * - 'object': Single object (current element data)
     * - 'collection': Array of items
     * - 'key-value': Large key-value store (schema)
     * - 'stream': Continuously updating data
     */
    dataType: 'object' | 'collection' | 'key-value' | 'stream';

    /**
     * Preferred rendering strategy
     * - 'json': Render as JSON tree (default)
     * - 'virtualized': Use virtualized list/tree
     * - 'paginated': Load data in pages
     * - 'custom': Source provides its own renderer
     */
    renderStrategy: 'json' | 'virtualized' | 'paginated' | 'custom';

    /**
     * Size classification (affects optimization decisions)
     * - 'small': < 100 items, render all
     * - 'medium': 100-1000 items, consider virtualization
     * - 'large': > 1000 items, must virtualize/paginate
     */
    sizeHint: 'small' | 'medium' | 'large';

    /**
     * Features this source supports
     */
    features: {
        /** Can filter/search data */
        searchable: boolean;
        
        /** Can expand/collapse sections */
        expandable: boolean;
        
        /** Data changes over time */
        reactive: boolean;
        
        /** Supports lazy loading of nested data */
        lazyLoad: boolean;
        
        /** Can navigate to sub-items */
        navigable: boolean;
    };
}
```

### 2. Unified Data Source Interface

All sources implement the same interface, with optional methods based on capabilities:

```typescript
interface UnifiedDataSource<T = unknown> {
    /** Unique identifier */
    id: string;

    /** Display name */
    label: string;

    /** Source capabilities */
    capabilities: SourceCapabilities;

    /**
     * Get data (required for all sources)
     * For large sources, this returns metadata or first page only
     */
    getData(): T | null;

    /**
     * For key-value sources: get all keys
     * @requires capabilities.dataType === 'key-value'
     */
    getKeys?(): string[];

    /**
     * For key-value sources: get value for a key
     * @requires capabilities.dataType === 'key-value'
     */
    getValueForKey?(key: string): unknown | null;

    /**
     * For paginated sources: get a page of data
     * @requires capabilities.renderStrategy === 'paginated'
     */
    getPage?(page: number, pageSize: number): T[];

    /**
     * For searchable sources: filter data
     * @requires capabilities.features.searchable
     */
    search?(query: string): T | string[];

    /**
     * For reactive sources: subscribe to changes
     * @requires capabilities.features.reactive
     */
    subscribe?(callback: (data: T) => void): () => void;

    /**
     * For custom rendering: provide a React component
     * @requires capabilities.renderStrategy === 'custom'
     */
    CustomRenderer?: React.ComponentType<{ data: T }>;

    /**
     * Get count of items (for virtualization/pagination)
     */
    getCount?(): number;

    /**
     * Check if source is available
     */
    isAvailable(): boolean;
}
```

### 3. Source Examples

#### Small Source (Editor Data)

```typescript
const editorLocalSource: UnifiedDataSource = {
    id: 'editor-local',
    label: 'Local Element',
    
    capabilities: {
        dataType: 'object',
        renderStrategy: 'json',
        sizeHint: 'small',
        features: {
            searchable: true,
            expandable: true,
            reactive: true,
            lazyLoad: false,
            navigable: true,
        },
    },

    getData: () => elementorAdapter.getSelectedElement(),
    
    search: (query) => filterJsonByPath(getData(), query),
    
    subscribe: (callback) => {
        // Subscribe to element changes
        return elementorAdapter.onCommand('document/elements/select', () => {
            callback(getData());
        });
    },
    
    isAvailable: () => Boolean(elementorAdapter.getSelectedElement()),
};
```

#### Large Source (Style Schema)

```typescript
const styleSchemaSource: UnifiedDataSource = {
    id: 'style-schema',
    label: 'Style Schema',
    
    capabilities: {
        dataType: 'key-value',
        renderStrategy: 'virtualized',
        sizeHint: 'large',
        features: {
            searchable: true,
            expandable: true,
            reactive: false,
            lazyLoad: true,
            navigable: true,
        },
    },

    // For key-value, getData returns metadata
    getData: () => ({
        type: 'key-value-store',
        count: schemaAdapter.getCount(),
    }),
    
    getKeys: () => schemaAdapter.getKeys(),
    
    getValueForKey: (key) => schemaAdapter.getSchema(key),
    
    search: (query) => schemaAdapter.searchKeys(query),
    
    getCount: () => schemaAdapter.getCount(),
    
    isAvailable: () => schemaAdapter.isAvailable(),
};
```

#### Paginated Source (Large Database)

```typescript
const databaseSource: UnifiedDataSource = {
    id: 'database-meta',
    label: 'Post Meta',
    
    capabilities: {
        dataType: 'collection',
        renderStrategy: 'paginated',
        sizeHint: 'medium',
        features: {
            searchable: true,
            expandable: true,
            reactive: false,
            lazyLoad: true,
            navigable: false,
        },
    },

    getData: () => null, // Use pagination instead
    
    getPage: async (page, pageSize) => {
        return wordPressAdapter.fetch({
            action: 'get_post_meta_page',
            page,
            pageSize,
        });
    },
    
    getCount: () => wordPressAdapter.getMetaCount(),
    
    isAvailable: () => true,
};
```

---

## Infrastructure Components

### 1. Source Registry

Central registry that knows nothing about specific sources:

```typescript
interface SourceRegistry {
    /** Register a source */
    register(source: UnifiedDataSource): void;

    /** Get source by ID */
    get(id: string): UnifiedDataSource | null;

    /** Get all sources */
    getAll(): UnifiedDataSource[];

    /** Get sources matching capabilities */
    getByCapability(
        predicate: (caps: SourceCapabilities) => boolean
    ): UnifiedDataSource[];
}
```

### 2. Renderer Registry

Maps rendering strategies to components:

```typescript
interface RendererRegistry {
    /** Register a renderer for a strategy */
    register(
        strategy: RenderStrategy,
        renderer: React.ComponentType<RendererProps>
    ): void;

    /** Get renderer for a source */
    getRenderer(source: UnifiedDataSource): React.ComponentType<RendererProps>;
}

// Built-in renderers
const defaultRenderers = {
    'json': JsonRenderer,           // Current JsonViewer
    'virtualized': VirtualizedRenderer,  // For key-value, uses VirtualList
    'paginated': PaginatedRenderer,      // For paginated data
    'custom': (props) => {
        const { source, ...rest } = props;
        return source.CustomRenderer 
            ? <source.CustomRenderer {...rest} />
            : null;
    },
};
```

### 3. Data Viewer (Unified Component)

Single component that renders ANY source:

```typescript
interface DataViewerProps {
    /** Source to render */
    source: UnifiedDataSource;
    
    /** Container height for virtualization */
    height?: number;
    
    /** Override rendering strategy */
    forceStrategy?: RenderStrategy;
}

const DataViewer: React.FC<DataViewerProps> = ({ source, height, forceStrategy }) => {
    const strategy = forceStrategy ?? source.capabilities.renderStrategy;
    const Renderer = rendererRegistry.getRenderer(strategy);
    
    return (
        <Renderer
            source={source}
            height={height}
        />
    );
};
```

### 4. Active Content (No Special Cases)

```typescript
// BEFORE: Special case for schema
const ActiveTabContent = () => {
    const { activeTab } = useTabs();
    
    // ❌ BAD: Hardcoded special case
    if (activeTab === 'schema') {
        return <SchemaViewer />;
    }
    
    return <JsonViewer />;
};

// AFTER: Source-agnostic
const ActiveTabContent = () => {
    const { activeTab, activeSubTab } = useTabs();
    const source = sourceRegistry.get(`${activeTab}:${activeSubTab}`);
    const { size } = useBounds();
    
    if (!source || !source.isAvailable()) {
        return <EmptyState />;
    }
    
    // ✅ GOOD: Same code for all sources
    return (
        <DataViewer
            source={source}
            height={size.height - 180}
        />
    );
};
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED DATA ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SOURCES (All implement UnifiedDataSource)                                │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Editor       │  │ Database     │  │ Schema       │  │ Future...    │ │
│  │ Local        │  │ Meta         │  │ Styles       │  │              │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤ │
│  │ type: object │  │ type: object │  │ type: k-v    │  │ type: stream │ │
│  │ render: json │  │ render: json │  │ render: virt │  │ render: json │ │
│  │ size: small  │  │ size: small  │  │ size: large  │  │ size: small  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                 │                 │          │
└─────────┼─────────────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │                 │
          └────────────────┬┴─────────────────┴─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE (Source-Agnostic)                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Source Registry                                                      ││
│  │ • register(source)                                                   ││
│  │ • get(id): UnifiedDataSource                                         ││
│  │ • getByCapability(predicate): UnifiedDataSource[]                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ DataViewer                                                           ││
│  │ • Reads source.capabilities                                          ││
│  │ • Routes to appropriate renderer                                     ││
│  │ • No source-specific code                                            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Renderer Registry                                                    ││
│  │                                                                      ││
│  │  'json' ──────────► JsonRenderer (current JsonViewer)                ││
│  │  'virtualized' ───► VirtualizedRenderer (uses VirtualList lib)       ││
│  │  'paginated' ─────► PaginatedRenderer (loads pages on scroll)        ││
│  │  'custom' ────────► source.CustomRenderer                            ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ UI LAYER                                                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ActiveTabContent                                                     ││
│  │                                                                      ││
│  │   const source = sourceRegistry.get(activeSourceId);                 ││
│  │   return <DataViewer source={source} />;                             ││
│  │                                                                      ││
│  │   // That's it. No if/else, no special cases.                        ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Renderers

### JsonRenderer (Small Data)

For `renderStrategy: 'json'` — renders entire data as JSON:

```typescript
const JsonRenderer: React.FC<RendererProps> = ({ source, height }) => {
    const data = source.getData();
    
    return (
        <Scrollable height={height}>
            <JsonSyntax data={data} />
        </Scrollable>
    );
};
```

### VirtualizedRenderer (Large Key-Value)

For `renderStrategy: 'virtualized'` with `dataType: 'key-value'`:

```typescript
const VirtualizedRenderer: React.FC<RendererProps> = ({ source, height }) => {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    
    const keys = source.getKeys?.() ?? [];
    const selectedData = selectedKey 
        ? source.getValueForKey?.(selectedKey) 
        : null;
    
    if (view === 'detail' && selectedKey) {
        return (
            <DetailView
                title={selectedKey}
                data={selectedData}
                onBack={() => setView('list')}
                height={height}
            />
        );
    }
    
    return (
        <VirtualList
            items={keys}
            itemHeight={32}
            containerHeight={height}
            renderItem={(key) => (
                <ListItem 
                    key={key} 
                    onClick={() => {
                        setSelectedKey(key);
                        setView('detail');
                    }}
                />
            )}
        />
    );
};
```

### PaginatedRenderer (Large Collections)

For `renderStrategy: 'paginated'`:

```typescript
const PaginatedRenderer: React.FC<RendererProps> = ({ source, height }) => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        source.getPage?.(page, 50).then((pageData) => {
            setData(pageData);
            setLoading(false);
        });
    }, [page]);
    
    return (
        <div style={{ height }}>
            {loading ? <Spinner /> : <JsonSyntax data={data} />}
            <Pagination 
                current={page} 
                total={Math.ceil(source.getCount?.() ?? 0 / 50)}
                onChange={setPage}
            />
        </div>
    );
};
```

---

## Adding a New Source

With this architecture, adding a new source requires **zero infrastructure changes**:

### Step 1: Define Source

```typescript
// providers/logs/log-source.ts

export const logSource: UnifiedDataSource = {
    id: 'logs',
    label: 'Debug Logs',
    
    capabilities: {
        dataType: 'stream',
        renderStrategy: 'virtualized',
        sizeHint: 'large',
        features: {
            searchable: true,
            expandable: false,
            reactive: true,
            lazyLoad: false,
            navigable: false,
        },
    },

    getData: () => logBuffer.getAll(),
    
    getKeys: () => logBuffer.getAll().map((_, i) => String(i)),
    
    getValueForKey: (key) => logBuffer.get(Number(key)),
    
    search: (query) => logBuffer.filter(query),
    
    subscribe: (callback) => logBuffer.onUpdate(callback),
    
    getCount: () => logBuffer.size(),
    
    isAvailable: () => true,
};
```

### Step 2: Register Source

```typescript
// manager/register-sources.ts

sourceRegistry.register(logSource);
```

### Step 3: Done!

The infrastructure automatically:
- Adds it to the tab list
- Uses `VirtualizedRenderer` because `renderStrategy: 'virtualized'`
- Enables search because `features.searchable: true`
- Subscribes to updates because `features.reactive: true`

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Special cases** | `if (activeTab === 'schema')` | None — all sources equal |
| **Adding sources** | Modify infrastructure | Just register |
| **Rendering logic** | Scattered | Centralized in renderers |
| **Testing** | Hard to mock | Easy — just mock interface |
| **Extensibility** | Requires code changes | Declarative capabilities |

---

## File Structure

```
core/
├── sources/
│   ├── types.ts                    # UnifiedDataSource, SourceCapabilities
│   ├── registry.ts                 # SourceRegistry implementation
│   └── index.ts
│
├── renderers/
│   ├── types.ts                    # RendererProps, RenderStrategy
│   ├── registry.ts                 # RendererRegistry implementation
│   ├── json-renderer.tsx           # For small data
│   ├── virtualized-renderer.tsx    # For large key-value
│   ├── paginated-renderer.tsx      # For paginated data
│   └── index.ts
│
├── components/
│   ├── data-viewer/
│   │   ├── data-viewer.tsx         # Unified viewer component
│   │   └── index.ts
│   └── ...
│
├── providers/
│   ├── editor/
│   │   └── source.ts               # UnifiedDataSource implementation
│   ├── database/
│   │   └── source.ts
│   ├── schema/
│   │   └── source.ts
│   └── index.ts                    # Registers all sources
│
└── libs/                           # Stays generic
    └── virtual-list/               # Used by VirtualizedRenderer
```

---

## Migration Path

1. **Phase 1**: Define `UnifiedDataSource` interface
2. **Phase 2**: Create `SourceRegistry` and `RendererRegistry`
3. **Phase 3**: Wrap existing providers as `UnifiedDataSource`
4. **Phase 4**: Create `DataViewer` component
5. **Phase 5**: Replace `ActiveTabContent` with source-agnostic version
6. **Phase 6**: Remove special-case code

---

## Summary

**Key Principle**: The infrastructure should be **source-agnostic**. Sources declare their capabilities, and the infrastructure adapts. No source is "special" — they're all equal citizens with different characteristics.

```
Source ──declares──► Capabilities ──routes──► Appropriate Renderer
         (what I am)                         (how to show me)
```

# Browse View Architecture

## Problem Statement

When a provider supports "browsing" (showing a list of keys, then detail on selection), there's a coupling problem between:

1. **UI State** — Which key is selected (lives in `ActiveTabContent`)
2. **Provider State** — What data to show (lives in `DataSource`)

### Previous Flow (Broken)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ BROKEN: Event-Based Coupling (Unpredictable)                             │
└─────────────────────────────────────────────────────────────────────────┘

1. User clicks key in BrowseView
2. ActiveTabContent sets selectedBrowsedKeys[variant] = key
3. useEffect runs, emits eventBus.emit('browse:key:selected', { key })
4. Provider's eventBus.on('browse:key:selected') fires
5. Provider calls notify(schema[key])
6. UI updates

Problems:
• Event timing is unpredictable (race conditions)
• Source restarts on tab switch → loses listener
• Coming back to tab → no event fired → shows stale data
• Circular: UI → Event → Provider → UI
```

### Issues With Events

1. **Race condition** — Event may fire before provider's listener is set up
2. **Lost on tab switch** — Source restarts, old listener is gone
3. **No initial sync** — Coming back to tab, selected key exists but no event fires
4. **Tight coupling** — UI and Provider communicate through events instead of props

---

## Solution: Dedicated BrowseContext ✅

We chose a **dedicated `BrowseContext`** for browse navigation that lives **alongside** `FilterProvider`.

### Why a Separate Context?

1. **Separation of concerns** — Browse navigation is its own concept
2. **No prop drilling** — Both `useProvider` and `ActiveTabContent` access it directly
3. **Clear ownership** — One context owns selection state
4. **Idiomatic React** — Pure React patterns, no external stores

---

## Implementation

### Context Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FINAL CONTEXT HIERARCHY                                                  │
└─────────────────────────────────────────────────────────────────────────┘

Shell.tsx
└── TabsProvider             ← owns activeTab, activeSubTab
    └── PathProvider         ← owns path (for JSON filtering)
        └── BrowseProvider   ← NEW: owns selectedKey per variant ✅
            └── FilterProvider
                │
                ├── calls useProvider()
                │   └── reads useBrowse().selectedKey
                │   └── passes to source config
                │
                └── provides via useFilteredData():
                    • data, originalData, path, etc.
                            │
                            ▼
                    ActiveTabContent
                        │
                        ├── useFilteredData()  ← for data
                        └── useBrowse()        ← for selection control
```

### BrowseContext Implementation

```typescript
// context/browse-context.tsx

type BrowseContextState = {
    /** Currently selected key for the active variant (null = browse mode) */
    selectedKey: string | null;
    
    /** Set the selected key (triggers source to show detail) */
    setSelectedKey: (key: string | null) => void;
    
    /** Whether currently in browse mode (no selection) */
    isBrowsing: boolean;
    
    /** Go back to browse mode */
    back: () => void;
};

export const BrowseProvider = ({ children }: PropsWithChildren) => {
    const { activeTab, activeSubTab } = useTabs();
    
    // Store selections per variant (persists across tab switches)
    const [selections, setSelections] = useState<Record<string, string | null>>({});
    
    // Key for current variant
    const variantKey = `${activeTab}:${activeSubTab}`;
    
    // Current selection for active variant
    const selectedKey = selections[variantKey] ?? null;
    
    // Check if current provider supports browsing
    const supportsBrowsing = useMemo(() => {
        const config = getProviderConfig().find(({ id }) => id === activeTab);
        return config?.supportsBrowsing ?? false;
    }, [activeTab]);
    
    // In browse mode if: supports browsing AND no selection
    const isBrowsing = supportsBrowsing && selectedKey === null;
    
    const setSelectedKey = useCallback((key: string | null) => {
        setSelections(prev => ({ ...prev, [variantKey]: key }));
    }, [variantKey]);
    
    const back = useCallback(() => {
        setSelectedKey(null);
    }, [setSelectedKey]);

    return (
        <BrowseContext.Provider value={{ selectedKey, setSelectedKey, isBrowsing, back }}>
            {children}
        </BrowseContext.Provider>
    );
};

export const useBrowse = () => {
    const context = useContext(BrowseContext);
    if (!context) {
        throw new Error("useBrowse must be used within a BrowseProvider");
    }
    return context;
};
```

### useProvider Reads Selection

```typescript
// hooks/use-provider.ts

export function useProvider() {
    const { activeTab, activeSubTab } = useTabs();
    const { selectedKey } = useBrowse();  // ← Read from BrowseContext
    const [data, setData] = useState({});
    const activeSource = useRef<DataSource | null>(null);

    // Re-run when tab, variant, OR selectedKey changes
    useEffect(() => {
        const variant = dataProviderManager.getSource(activeTab, activeSubTab);
        
        activeSource.current?.stop();
        
        // Include selectedKey in source config
        const config = {
            ...variant.sourceConfig,
            selectedKey,
        };
        
        activeSource.current = variant.createSource(config);
        activeSource.current.start((sourceData) => {
            setData(prev => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], [activeSubTab]: sourceData },
            }));
        });

        return () => activeSource.current?.stop();
    }, [activeTab, activeSubTab, selectedKey]);  // ← selectedKey in deps

    return data[activeTab]?.[activeSubTab];
}
```

### Source Uses Config

```typescript
// providers/schema/provider.ts

createSource: createSource((notify, config) => {
    const schema = elementorAdapter.getStyleSchema();
    const keys = Object.keys(schema);

    return {
        setup: () => {
            // Config includes selectedKey from BrowseContext
            const { selectedKey } = config;
            
            if (selectedKey && schema[selectedKey]) {
                // Detail mode: show selected key's data
                notify(schema[selectedKey] as SchemaData);
            } else {
                // Browse mode: show all keys
                notify(keys as unknown as SchemaData);
            }
        },
        teardown: () => {}
    };
})
```

### ActiveTabContent Uses Both Contexts

```typescript
// popovers/main/active-tab-content.tsx

export const ActiveTabContent = () => {
    const { originalData } = useFilteredData();   // ← Data
    const { isBrowsing, setSelectedKey, back } = useBrowse();  // ← Selection
    
    const hasData = Boolean(originalData);
    const isEmpty = !hasData;

    // Empty state
    if (isEmpty) {
        return <EmptyState />;
    }

    // Browse mode - show list of keys
    if (isBrowsing) {
        return <BrowseView onSelect={setSelectedKey} />;
    }

    // Detail mode - show JSON with back button
    return <JsonView onBack={back} />;
};
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CLEAN DATA FLOW                                                          │
└─────────────────────────────────────────────────────────────────────────┘

                         BrowseProvider
                    ┌─────────────────────┐
                    │ selections = {      │
                    │   'schema:style-    │
                    │    schema': 'color' │
                    │ }                   │
                    │                     │
                    │ selectedKey ────────┼─────────────────────┐
                    │ setSelectedKey      │                     │
                    │ isBrowsing          │                     │
                    │ back                │                     │
                    └─────────────────────┘                     │
                           │                                    │
          ┌────────────────┴────────────────┐                   │
          │                                 │                   │
          ▼                                 ▼                   ▼
    ┌───────────────┐               ┌───────────────┐    ┌───────────────┐
    │ FilterProvider│               │ useProvider() │    │ActiveTabContent│
    │               │               │               │    │               │
    │ useProvider() │◄──────────────│ useBrowse()   │    │ useBrowse()   │
    │     │         │               │ .selectedKey  │    │ .isBrowsing   │
    │     │         │               │               │    │ .setSelectedKey│
    │     ▼         │               │ Pass to       │    │ .back         │
    │ originalData  │               │ source config │    │               │
    └───────────────┘               └───────────────┘    └───────────────┘
```

---

## Tab Switch Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TAB SWITCH WITH PERSISTED SELECTION                                      │
└─────────────────────────────────────────────────────────────────────────┘

1. User is on Schema tab, has selected "color" key
   BrowseContext.selections = { 'schema:style-schema': 'color' }

2. User switches to Editor tab
   • activeTab changes to 'editor'
   • variantKey = 'editor:local'
   • selectedKey for editor = null
   • Schema source stops, Editor source starts
   • selections map is UNCHANGED ✅

3. User switches back to Schema tab
   • activeTab changes to 'schema'
   • variantKey = 'schema:style-schema'
   • selectedKey = selections['schema:style-schema'] = 'color'
   • Source starts with config.selectedKey = 'color'
   • Immediately shows "color" data ✅

Result: Selection is preserved!
```

---

## Comparison

| Aspect | Before (Events) | After (BrowseContext) |
|--------|-----------------|----------------------|
| **Selection storage** | UI component state | BrowseContext |
| **Who owns it** | ActiveTabContent | BrowseProvider |
| **Communication** | eventBus.emit/on | Context value |
| **To useProvider** | Event listener | Direct context read |
| **Prop drilling** | N/A (events) | None |
| **Timing** | Unpredictable | Synchronous |
| **Tab switch** | Lost | Preserved |

---

## Benefits

1. **No events** — Direct state flow, no timing issues
2. **No prop drilling** — Both consumers access `useBrowse()` directly
3. **Selection persists** — Stored in context, survives tab switches
4. **Predictable updates** — Source restarts when selectedKey changes
5. **Separation of concerns** — Browse logic separate from tabs and filtering
6. **Testable** — Mock `BrowseProvider`, test in isolation

---

## Summary

**Key insight**: Selection needs to be accessed by both:
- `useProvider` (to pass to source config)
- `ActiveTabContent` (to control UI)

A **dedicated `BrowseContext`** provides clean access to both without prop drilling.

```typescript
// ❌ Before: Event coupling
eventBus.emit('browse:key:selected', { key });

// ✅ After: Shared context
const { selectedKey, setSelectedKey, isBrowsing, back } = useBrowse();
```

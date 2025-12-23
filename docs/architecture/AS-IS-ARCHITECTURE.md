# Dev Debug Tool — As-Is Architecture

## Overview

This document describes the current architecture of the Dev Debug Tool plugin as extracted from the codebase. This serves as a baseline for understanding the system before refactoring.

---

## System Purpose

A WordPress plugin that provides real-time database and editor schema viewing within the Elementor editor interface. Developers can:

- View live JSON snapshots of selected Elementor elements
- Browse persisted Elementor data from the database
- Search JSON paths with autocomplete
- Copy/export JSON data

---

## Implicit Architectural Style

The plugin follows a **hybrid architecture**:

| Pattern | Layer | Description |
|---------|-------|-------------|
| WordPress Plugin Pattern | Backend | Hook-based PHP with PSR-4 autoloading |
| React Component Architecture | Frontend | Modern React with Context API |
| Provider Pattern | Data Layer | Unified data source abstraction |
| Event-Driven Communication | Integration | Custom events bridge Elementor ↔ React |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | PHP 7.4+, WordPress Hooks, Composer (PSR-4) |
| Frontend | TypeScript, React 18, WordPress Scripts |
| Build | Webpack (via @wordpress/scripts), SCSS |
| Dependencies | react-syntax-highlighter, @wordpress/components |

---

## System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL CONTEXT                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐                                      ┌──────────────────┐
    │              │                                      │                  │
    │  Developer   │◄─────── Views/Interacts ────────────►│  Elementor       │
    │  (User)      │                                      │  Editor UI       │
    │              │                                      │                  │
    └──────────────┘                                      └────────┬─────────┘
                                                                   │
                                                                   │ Embeds
                                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         DEV DEBUG TOOL PLUGIN                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    React Debug Panel UI                              │   │
│   │   (Toggle Button, Popovers, JSON Viewer, Path Search)               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    │ AJAX                                   │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    WordPress/PHP Backend                             │   │
│   │   (AJAX Handler, Script Enqueueing, Nonce Validation)               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │  WordPress   │ │   Elementor  │ │   Elementor  │
           │  Database    │ │   $e API     │ │   Kit Data   │
           │  (wp_postmeta│ │  (Commands)  │ │  (Variables, │
           └──────────────┘ └──────────────┘ │   Classes)   │
                                             └──────────────┘
```

---

## File Structure

```
dev-debug-tool/
├── dev-debug-tool.php          # Plugin entry point
├── composer.json               # PHP autoloading
├── package.json                # npm dependencies
├── webpack.config.js           # Build configuration
├── tsconfig.json               # TypeScript config
│
├── src/                        # PHP Backend
│   ├── App.php                 # Hook initializer
│   ├── Debug.php               # Script/style enqueuing
│   └── Database_Ajax.php       # AJAX endpoint
│
├── assets/
│   ├── js/
│   │   ├── main.ts             # React entry point
│   │   ├── App.tsx             # Root component
│   │   ├── Panel.tsx           # Panel container
│   │   ├── popovers/           # Popover components
│   │   └── core/               # Core modules
│   │       ├── manager/        # Provider registry
│   │       ├── providers/      # Data providers
│   │       ├── context/        # React contexts
│   │       ├── hooks/          # Custom hooks
│   │       ├── events/         # Event system
│   │       ├── actions-registry/
│   │       ├── components/     # UI components
│   │       ├── libs/           # Utilities
│   │       └── utils/
│   │
│   └── scss/                   # Styles
│
├── build/                      # Compiled output
└── vendor/                     # Composer dependencies
```

---

## Major Components

### PHP Backend

| Component | File | Responsibility |
|-----------|------|----------------|
| Entry Point | `dev-debug-tool.php` | Plugin bootstrap, Elementor check, constants |
| App | `src/App.php` | Registers hooks for Debug and Database_Ajax |
| Debug | `src/Debug.php` | Enqueues scripts/styles, injects HTML slot |
| Database_Ajax | `src/Database_Ajax.php` | AJAX handler for fetching post meta |

### React Frontend

| Component | File | Responsibility |
|-----------|------|----------------|
| main.ts | `assets/js/main.ts` | React DOM mounting |
| App | `assets/js/App.tsx` | Provider setup, registrations |
| Panel | `assets/js/Panel.tsx` | Conditional popover rendering |
| MainPopover | `popovers/MainPopover.tsx` | Draggable/resizable JSON viewer |
| SuggestionsPopover | `popovers/SuggestionsPopover.tsx` | Path search suggestions |

### Core Layer

| Module | Path | Responsibility |
|--------|------|----------------|
| DataProviderManager | `core/manager/` | Registry for data providers |
| EditorProvider | `core/providers/editor-provider/` | Subscribes to Elementor element events |
| DatabaseProvider | `core/providers/database-provider/` | Fetches persisted data via AJAX |
| TabsContext | `core/context/tabs/` | Tab navigation state |
| FilterContext | `core/context/filter-context.tsx` | JSON path filtering |
| PopoverContext | `core/context/popover-context.tsx` | Popover visibility state |
| ActionsRegistry | `core/actions-registry/` | Extensible action buttons |

---

## Data Flow

### Initialization Sequence

```
1. WordPress loads plugin
         │
         ▼
2. dev-debug-tool.php
   - Checks Elementor active
   - Defines constants
   - Calls App::init()
         │
         ▼
3. App::init()
   - Hooks Debug and Database_Ajax to 'init'
         │
         ▼
4. On Elementor editor load:
   - Debug::enqueue_scripts()
   - Debug::enqueue_styles()
   - Debug::print_html_slot()
         │
         ▼
5. React mounts into #dev-debug-slot
   - registerDataProviders()
   - registerActions()
   - Render App component
```

### Element Selection Flow

```
User clicks element in Elementor
         │
         ▼
Elementor: $e.run('document/elements/select')
         │
         ▼
listenToElementorEvent() catches 'run:after'
         │
         ▼
localMode.subscribeToElement()
  - getSelectedElement()
  - dataExtractor.extract()
         │
         ▼
notify(extractedData)
         │
         ▼
useDataProvider() updates state
         │
         ▼
FilterContext recalculates
         │
         ▼
TabPanel renders JsonSyntaxHighlighter
```

### Database Fetch Flow

```
User saves in Elementor
         │
         ▼
'document/save/update' event
         │
         ▼
databaseProvider.subscribe callback
         │
         ▼
HTTP POST to admin-ajax.php
  action: dev_debug_tool_get_database_schema
  post_id: <id>
  meta_key: _elementor_data
  nonce: <nonce>
         │
         ▼
Database_Ajax::get_database_schema()
  - Validates nonce
  - Checks permissions
  - get_post_meta()
         │
         ▼
JSON response → UI updates
```

---

## Context Provider Hierarchy

```tsx
<SlotFillProvider>           // WordPress slot/fill
  <PopoverProvider>          // Popover visibility state
    <BoundsProvider>         // Window bounds tracking
      <ToggleButton />
      <PositionTracker />
      <Panel>
        <TabsProvider>       // Tab navigation
          <FilterProvider>   // JSON filtering
            <MainPopover />
            <SuggestionsPopover />
          </FilterProvider>
        </TabsProvider>
      </Panel>
    </BoundsProvider>
  </PopoverProvider>
</SlotFillProvider>
```

---

## Provider Interface

```typescript
interface DataProvider {
  id: string;
  title: string;
  get?: () => Promise<unknown>;
  subscribe: (cb: (data: unknown) => void) => () => void;
  getMessage: (data: unknown) => string;
  order?: number;
  shouldShowData?: (data: unknown) => boolean;
  variants?: Record<string, { label: string }>;
}
```

### Registered Providers

| Provider | ID | Variants | Data Source |
|----------|-----|----------|-------------|
| EditorProvider | `editor` | local, global_classes | Elementor element model |
| DatabaseProvider | `database` | post, variables, global_classes | wp_postmeta via AJAX |

---

## Event System

### Custom DOM Events

| Event | Purpose |
|-------|---------|
| `dev-debug/position/change` | Element position changed |
| `dev-debug/window/resize` | Window resized |
| `dev-debug/popover/drag` | Popover dragged |
| `dev-debug/popover/resize` | Popover resized |
| `dev-debug/suggestion/select` | Path suggestion selected |
| `dev-debug/switch/sub-tab` | Sub-tab changed |
| `dev-debug/{provider}/{variant}/data/get` | Trigger data refetch |

### Elementor Events (via $e.commands)

| Command | When Triggered |
|---------|----------------|
| `document/elements/select` | Element selected |
| `document/elements/deselect` | Element deselected |
| `document/elements/delete` | Element deleted |
| `document/save/update` | Document saved |
| `panel/exit` | Panel closed |

---

## Identified Issues

### Coupling Problems

| Issue | Severity | Files Affected |
|-------|----------|----------------|
| Direct Elementor API usage | High | `listen-to-elementor-event.ts`, `get-elementor-commands.ts` |
| Global window pollution | Medium | `get-settings.ts` |
| Provider ↔ UI coupling | Medium | `build-tabs.ts` imports from manager |

### Maintainability Risks

| Risk | Impact | Description |
|------|--------|-------------|
| Dead code | Low | 150+ lines of comments in `use-data-provider.ts` |
| Any types | Medium | TypeScript benefits defeated |
| No error handling | High | React errors crash entire panel |
| No caching | Medium | Redundant data extraction |

### Performance Concerns

| Concern | Impact |
|---------|--------|
| Synchronous JSON.stringify | Blocks main thread for large data |
| 4 nested contexts | Potential re-render cascade |
| No memoization | Redundant computations |

---

## See Also

- [To-Be Architecture](./TO-BE-ARCHITECTURE.md)
- [Migration Plan](./MIGRATION-PLAN.md)


# Dev Debug Tool — Architecture Documentation

This folder contains the architectural analysis and improvement plan for the Dev Debug Tool WordPress plugin.

## Documents

| Document | Description |
|----------|-------------|
| [PRODUCT-REQUIREMENTS.md](./PRODUCT-REQUIREMENTS.md) | **Start here** — Problems, users, features, and roadmap |
| [AS-IS-ARCHITECTURE.md](./AS-IS-ARCHITECTURE.md) | Current architecture as extracted from the codebase |
| [TO-BE-ARCHITECTURE.md](./TO-BE-ARCHITECTURE.md) | Target architecture with proposed improvements |
| [PROVIDERS-AND-VARIANTS.md](./PROVIDERS-AND-VARIANTS.md) | Deep dive into provider/variant architecture |
| [HIGHLIGHT-AND-SCROLLABLE.md](./HIGHLIGHT-AND-SCROLLABLE.md) | Clean architecture for highlight/scroll features |
| [STYLE-SCHEMA-ARCHITECTURE.md](./STYLE-SCHEMA-ARCHITECTURE.md) | Virtualized schema viewer (handling large data) |
| [UNIFIED-DATA-SOURCES.md](./UNIFIED-DATA-SOURCES.md) | **Future vision** — Source-agnostic infrastructure |
| [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) | Step-by-step migration plan with code examples |

## Diagrams

All diagrams are in Mermaid format (`.mmd` files) located in the `diagrams/` folder:

### Architecture Diagrams
| Diagram | Description |
|---------|-------------|
| [to-be-container-diagram.mmd](./diagrams/to-be-container-diagram.mmd) | High-level component architecture |
| [to-be-data-flow.mmd](./diagrams/to-be-data-flow.mmd) | Element selection → JSON display sequence |
| [to-be-state-flow.mmd](./diagrams/to-be-state-flow.mmd) | Application state machine |
| [to-be-file-structure.mmd](./diagrams/to-be-file-structure.mmd) | Target file organization |
| [migration-phases.mmd](./diagrams/migration-phases.mmd) | Migration timeline Gantt chart |

### Provider/Variant Diagrams
| Diagram | Description |
|---------|-------------|
| [providers-variants.mmd](./diagrams/providers-variants.mmd) | Providers, variants, and data sources overview |
| [variant-lifecycle.mmd](./diagrams/variant-lifecycle.mmd) | Variant switching sequence diagram |
| [variant-state-machine.mmd](./diagrams/variant-state-machine.mmd) | Variant state transitions |
| [provider-class-diagram.mmd](./diagrams/provider-class-diagram.mmd) | Class/interface relationships |

### Unified Data Sources Diagrams
| Diagram | Description |
|---------|-------------|
| [unified-data-sources.mmd](./diagrams/unified-data-sources.mmd) | Source-agnostic infrastructure overview |
| [source-capabilities.mmd](./diagrams/source-capabilities.mmd) | UnifiedDataSource interface and capabilities |
| [renderer-routing.mmd](./diagrams/renderer-routing.mmd) | How capabilities route to renderers |

### Viewing Diagrams

**Option 1: VS Code / Cursor**
Install the "Markdown Preview Mermaid Support" extension, then preview any `.mmd` file.

**Option 2: Mermaid Live Editor**
Copy the contents of any `.mmd` file to [mermaid.live](https://mermaid.live/) to render.

**Option 3: GitHub**
GitHub automatically renders Mermaid diagrams in markdown files.

## Quick Summary

### Current Issues (As-Is)

1. **Tight Elementor coupling** — Direct use of `$e.commands` makes the plugin fragile
2. **4 nested React contexts** — Complex state management with potential re-render issues
3. **No error handling** — React errors crash the entire debug panel
4. **No caching** — Redundant data extraction on element re-selection
5. **Dead code** — 150+ lines of commented code creating noise

### Proposed Improvements (To-Be)

1. **Adapter Layer** — `ElementorAdapter` and `WordPressAdapter` isolate external APIs
2. **Merged AppContext** — Single reducer replaces 4 contexts
3. **ErrorBoundary** — Graceful error handling
4. **CacheManager** — LRU cache for extracted data
5. **Typed EventBus** — Compile-time event type checking

### Migration Approach

- **No big rewrite** — Incremental improvements
- **4 phases** over ~2 months
- Each step is independently deployable
- Rollback-safe with Git commits

## Getting Started

1. Read [AS-IS-ARCHITECTURE.md](./AS-IS-ARCHITECTURE.md) to understand the current system
2. Review [TO-BE-ARCHITECTURE.md](./TO-BE-ARCHITECTURE.md) for the target state
3. Follow [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) for implementation steps

## Architecture Principles

- **Adapter Pattern** — Isolate external dependencies
- **Single Source of Truth** — Consolidated state management
- **Fail Gracefully** — Error boundaries prevent crashes
- **Cache First** — Avoid redundant computations
- **Type Safety** — Strict TypeScript throughout
- **Source Agnostic** — Infrastructure handles any data source equally


# Dev Debug Tool — Product Requirements

## What Problem Are We Solving?

### The Core Problem

**Elementor developers work blind.**

When building complex Elementor pages, developers constantly need to understand:
- What data is stored for each element?
- How does the editor represent element settings internally?
- What's actually saved to the database vs. what's shown in the UI?
- Why isn't my dynamic content working?

Currently, developers must:
1. Open browser DevTools
2. Navigate complex Elementor JavaScript objects
3. Query the database directly via phpMyAdmin
4. Decode serialized/JSON data manually
5. Repeat this process for every element, every time

**This wastes hours of developer time and creates friction in the development workflow.**

---

## Target Users

### Primary: Elementor Theme/Plugin Developers

| Persona | Description | Pain Points |
|---------|-------------|-------------|
| **Extension Developer** | Builds custom Elementor widgets and extensions | Needs to understand Elementor's data structures to integrate properly |
| **Theme Developer** | Creates Elementor-compatible themes | Needs to debug why global styles aren't applying |
| **Agency Developer** | Builds client sites with advanced customizations | Needs to quickly diagnose content issues |

### Secondary: Advanced Power Users

| Persona | Description | Pain Points |
|---------|-------------|-------------|
| **Site Builder** | Non-developer who builds complex sites | Needs to understand why dynamic content isn't showing |
| **Support Engineer** | Helps users troubleshoot issues | Needs quick visibility into page structure |

---

## User Stories

### Must Have (P0)

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-01 | Developer | See the live JSON structure of a selected element | I can understand how Elementor represents it internally |
| US-02 | Developer | View the raw database content for the current page | I can compare editor state vs. persisted state |
| US-03 | Developer | Search/filter JSON by path | I can quickly find specific properties in large data structures |
| US-04 | Developer | Copy JSON data to clipboard | I can paste it into tests, documentation, or bug reports |
| US-05 | Developer | Keep the tool open while working | I don't have to repeatedly open/close DevTools |

### Should Have (P1)

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-06 | Developer | See global classes applied to an element | I can debug styling issues |
| US-07 | Developer | See global variables (colors, fonts) | I can understand the design system |
| US-08 | Developer | Export data as a JSON file | I can save snapshots for later analysis |
| US-09 | Developer | Have the panel remember its position/size | I don't have to reposition it every time |
| US-10 | Developer | See real-time updates when I change element settings | I can observe how changes affect the data |

### Could Have (P2)

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-11 | Developer | Compare two elements side-by-side | I can spot differences in configuration |
| US-12 | Developer | See a diff when data changes | I can understand exactly what changed |
| US-13 | Developer | Bookmark specific JSON paths | I can quickly return to frequently checked properties |
| US-14 | Developer | See type annotations for values | I can understand what data types Elementor expects |

### Won't Have (for now)

| ID | Feature | Reason |
|----|---------|--------|
| WH-01 | Edit data directly | Too risky; could corrupt page data |
| WH-02 | Multi-page analysis | Scope creep; focus on single-page debugging first |
| WH-03 | Historical data tracking | Requires backend storage; out of scope |

---

## Features

### Feature 1: Live Element Inspector

**Problem:** Developers can't see element data without digging through DevTools.

**Solution:** When an element is selected in Elementor, instantly display its complete JSON structure in a floating panel.

| Requirement | Priority | Status |
|-------------|----------|--------|
| Show element settings as JSON | P0 | ✅ Implemented |
| Update in real-time when settings change | P0 | ✅ Implemented |
| Handle nested/complex data structures | P0 | ✅ Implemented |
| Syntax highlighting for readability | P1 | ✅ Implemented |
| Collapse/expand JSON nodes | P2 | ❌ Not implemented |

**Success Metric:** Developer can view element data in <1 second after selection.

---

### Feature 2: Database Schema Viewer

**Problem:** Developers need to query the database directly to see persisted data.

**Solution:** Fetch and display the raw Elementor data stored in `wp_postmeta` via a secure AJAX endpoint.

| Requirement | Priority | Status |
|-------------|----------|--------|
| Fetch `_elementor_data` for current post | P0 | ✅ Implemented |
| Secure with nonce validation | P0 | ✅ Implemented |
| Show loading state during fetch | P1 | ✅ Implemented |
| Refresh automatically after save | P1 | ✅ Implemented |
| View global variables from kit | P1 | ✅ Implemented |
| View global classes from kit | P1 | ✅ Implemented |

**Success Metric:** Developer can view database content without leaving the editor.

---

### Feature 3: JSON Path Search

**Problem:** Elementor data structures are deeply nested; finding specific properties is tedious.

**Solution:** Provide a search input that filters/navigates to matching JSON paths.

| Requirement | Priority | Status |
|-------------|----------|--------|
| Search by property name | P0 | ✅ Implemented |
| Show path suggestions as you type | P1 | ✅ Implemented |
| Navigate directly to matched path | P1 | ✅ Implemented |
| Support dot notation (e.g., `settings.typography.font_size`) | P1 | ✅ Implemented |
| Highlight matching values | P2 | ❌ Not implemented |

**Success Metric:** Developer can find any property in <5 seconds.

---

### Feature 4: Data Export

**Problem:** Developers need to share or save data snapshots for debugging and documentation.

**Solution:** Provide copy-to-clipboard and file export actions.

| Requirement | Priority | Status |
|-------------|----------|--------|
| Copy current JSON to clipboard | P0 | ✅ Implemented |
| Export as `.json` file download | P1 | ✅ Implemented |
| Copy specific path/value | P2 | ❌ Not implemented |
| Export with metadata (timestamp, post ID) | P2 | ❌ Not implemented |

**Success Metric:** Developer can export data with 2 clicks or less.

---

### Feature 5: Floating Panel UI

**Problem:** DevTools takes up screen real estate and disrupts workflow.

**Solution:** A floating, draggable, resizable panel that integrates seamlessly with the Elementor editor.

| Requirement | Priority | Status |
|-------------|----------|--------|
| Toggle panel with a button | P0 | ✅ Implemented |
| Draggable to any position | P0 | ✅ Implemented |
| Resizable | P0 | ✅ Implemented |
| Persist position/size across sessions | P1 | ❌ Not implemented |
| Minimize/maximize | P2 | ❌ Not implemented |
| Dark theme matching Elementor | P1 | ✅ Implemented |

**Success Metric:** Panel doesn't obstruct editor workflow.

---

### Feature 6: Tab-Based Navigation

**Problem:** Multiple data sources (editor, database, variants) need organized access.

**Solution:** Tabbed interface to switch between data sources.

| Requirement | Priority | Status |
|-------------|----------|--------|
| Editor tab (live element data) | P0 | ✅ Implemented |
| Database tab (persisted data) | P0 | ✅ Implemented |
| Sub-tabs for variants (local, global classes) | P1 | ✅ Implemented |
| Visual indicator for active tab | P1 | ✅ Implemented |
| Keyboard navigation | P2 | ❌ Not implemented |

**Success Metric:** Developer can switch views in <1 second.

---

## Feature Roadmap

### Phase 1: Foundation (Current) ✅

- [x] Live element inspector
- [x] Database schema viewer
- [x] Basic JSON display with syntax highlighting
- [x] Copy to clipboard action
- [x] Floating panel with drag/resize
- [x] Tab navigation

### Phase 2: Enhanced Usability (Next)

- [ ] JSON path search with autocomplete
- [ ] Panel position/size persistence
- [ ] Error boundary for graceful failures
- [ ] Performance optimization (caching)

### Phase 3: Power Features (Future)

- [ ] Collapsible JSON nodes
- [ ] Value diff highlighting
- [ ] Keyboard shortcuts
- [ ] Multiple export formats

### Phase 4: Advanced (Roadmap)

- [ ] Side-by-side comparison
- [ ] Bookmarked paths
- [ ] Type annotations
- [ ] Custom themes

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Current |
|-------------|--------|---------|
| Time to display element data | < 100ms | ~150ms |
| Time to fetch database data | < 500ms | ~300ms |
| Panel render time | < 50ms | ~80ms |
| Memory footprint | < 10MB | ~15MB |

### Reliability

| Requirement | Target |
|-------------|--------|
| Crash rate | < 0.1% of sessions |
| Error recovery | Graceful fallback UI |
| Data integrity | Read-only, never corrupt user data |

### Compatibility

| Requirement | Target |
|-------------|--------|
| Elementor versions | 3.0+ |
| WordPress versions | 6.0+ |
| Browsers | Chrome, Firefox, Safari, Edge (latest 2 versions) |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | WordPress nonce validation |
| Authorization | `edit_posts` capability required |
| Data exposure | Only accessible to authenticated editors |

---

## Success Metrics

### Adoption

| Metric | Target |
|--------|--------|
| Weekly active users | 100+ (first 3 months) |
| Retention (7-day) | > 40% |
| Feature usage (search) | > 30% of sessions |

### Satisfaction

| Metric | Target |
|--------|--------|
| User rating | > 4.5/5 |
| Support tickets (bugs) | < 5/week |
| "Would recommend" (NPS) | > 50 |

### Efficiency

| Metric | Target |
|--------|--------|
| Time saved per debug session | > 5 minutes |
| DevTools usage reduction | > 50% |

---

## Competitive Analysis

| Tool | Strengths | Weaknesses | Our Advantage |
|------|-----------|------------|---------------|
| Browser DevTools | Universal, powerful | Not Elementor-aware, complex | Elementor-specific, streamlined |
| Query Monitor (WP plugin) | Great for hooks/queries | No Elementor integration | Native Elementor integration |
| Debug Bar | Extensible | Outdated UI, no live updates | Modern UI, real-time updates |
| Elementor Navigator | Official, element tree | No data inspection | Full data visibility |

---

## Open Questions

1. **Should we support Elementor Pro-only features?**
   - Global widgets, theme builder, etc.
   - Decision: Yes, but gracefully degrade for free users.

2. **How do we handle very large pages (100+ elements)?**
   - Current: Full JSON displayed
   - Proposed: Virtual scrolling, lazy loading

3. **Should we integrate with browser DevTools?**
   - E.g., inject data into console, add to Elements panel
   - Decision: Defer to Phase 4

---

## Appendix: Terminology

| Term | Definition |
|------|------------|
| Element | A widget, section, or container in Elementor |
| Container | Elementor's internal model wrapping an element |
| Kit | Global settings (colors, fonts, global classes) |
| Marionette | Backbone.js framework Elementor uses internally |
| `$e` | Elementor's command system (routes, commands) |
| `_elementor_data` | Post meta key storing page JSON structure |

---

## See Also

- [TO-BE-ARCHITECTURE.md](./TO-BE-ARCHITECTURE.md) — Technical architecture
- [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) — Implementation roadmap
- [AS-IS-ARCHITECTURE.md](./AS-IS-ARCHITECTURE.md) — Current system analysis



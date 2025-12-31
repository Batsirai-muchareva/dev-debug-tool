# Highlight & Scrollable Architecture

## Current State Analysis

You have three related concerns mixed together:

1. **Scrollable** — Container with scroll behavior
2. **Scroll-to-line** — Navigate to a specific line
3. **Highlight** — Visual indicator for changed/found lines

Currently:
- `Scrollable` component handles both scrolling AND scroll-to-line
- `JsonSyntaxHighlighter` adds `data-line` attributes
- `getUpdatedLines` calculates what changed (highlight logic)
- Highlight is commented out

**Problems:**
- `Scrollable` has two responsibilities (scroll container + scroll-to behavior)
- Tight coupling between scroll and highlight
- Logic spread across multiple files
- Hard to test and reuse

---

## Recommended Architecture

### Separation of Concerns

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LAYER SEPARATION                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ UTILS (Pure Functions)                                                   │
│                                                                          │
│  json-diff.ts        → Calculate differences between two JSON objects   │
│  line-finder.ts      → Find DOM elements by line number                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ HOOKS (Stateful Logic)                                                   │
│                                                                          │
│  useScrollToLine()   → Scroll container to a line                       │
│  useHighlight()      → Add/remove highlight classes with animation      │
│  useJsonDiff()       → Track changes between renders                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ COMPONENTS (UI)                                                          │
│                                                                          │
│  <Scrollable />      → Pure scroll container (no logic)                 │
│  <JsonViewer />      → Composes everything together                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Should They Be Separate?

**Yes, but coordinated.** Here's why:

| Concern | Separate? | Reason |
|---------|-----------|--------|
| **Scrollable container** | Yes | Reusable, just a styled div with overflow |
| **Scroll-to-line logic** | Yes (hook) | Can be used independently of highlight |
| **Highlight logic** | Yes (hook) | Can highlight without scrolling |
| **JSON diff calculation** | Yes (util) | Pure function, testable, reusable |
| **Coordination** | Parent component | Orchestrates when to scroll + highlight |

---

## File Structure

```
core/
├── utils/
│   ├── json-diff.ts              # Pure diff calculation
│   └── line-finder.ts            # DOM utilities for finding lines
│
├── hooks/
│   ├── use-scroll-to-line.ts     # Scroll behavior hook
│   ├── use-highlight.ts          # Highlight animation hook
│   └── use-json-changes.ts       # Track JSON changes between renders
│
├── components/
│   ├── scrollable/
│   │   └── scrollable.tsx        # Pure scroll container
│   │
│   ├── json-viewer/
│   │   ├── json-viewer.tsx       # Main component (orchestrator)
│   │   ├── json-syntax.tsx       # Syntax highlighting wrapper
│   │   └── types.ts
│   │
│   └── highlight/
│       └── line-highlight.tsx    # Optional: Highlight overlay component
```

---

## Implementation

### 1. Pure Utility: `json-diff.ts`

```typescript
// utils/json-diff.ts

export interface LineDiff {
  lineNumber: number;
  type: 'added' | 'removed' | 'changed';
  content: string;
}

export interface DiffResult {
  /** Lines that changed */
  changes: LineDiff[];
  
  /** First changed line (for scroll target) */
  firstChange: number | null;
  
  /** Range of lines to highlight */
  highlightRange: number[];
}

/**
 * Calculate differences between two JSON values
 * Pure function - no side effects
 */
export function calculateJsonDiff(
  previous: unknown,
  current: unknown
): DiffResult {
  if (!current) {
    return { changes: [], firstChange: null, highlightRange: [] };
  }

  const prevString = JSON.stringify(previous, null, 2);
  const currString = JSON.stringify(current, null, 2);

  const prevLines = prevString.split('\n');
  const currLines = currString.split('\n');

  const changes: LineDiff[] = [];

  const maxLines = Math.max(prevLines.length, currLines.length);

  for (let i = 0; i < maxLines; i++) {
    const prevLine = prevLines[i]?.trim() ?? '';
    const currLine = currLines[i]?.trim() ?? '';

    if (prevLine !== currLine) {
      changes.push({
        lineNumber: i + 1,
        type: !prevLine ? 'added' : !currLine ? 'removed' : 'changed',
        content: currLines[i] ?? '',
      });
    }
  }

  const firstChange = changes.length > 0 ? changes[0].lineNumber : null;
  const highlightRange = changes.map((c) => c.lineNumber);

  return { changes, firstChange, highlightRange };
}
```

### 2. Pure Utility: `line-finder.ts`

```typescript
// utils/line-finder.ts

/**
 * Find a DOM element by line number attribute
 */
export function findLineElement(
  container: HTMLElement | null,
  lineNumber: number
): HTMLElement | null {
  if (!container) return null;
  return container.querySelector(`[data-line="${lineNumber}"]`);
}

/**
 * Find multiple line elements
 */
export function findLineElements(
  container: HTMLElement | null,
  lineNumbers: number[]
): HTMLElement[] {
  if (!container) return [];
  return lineNumbers
    .map((n) => findLineElement(container, n))
    .filter((el): el is HTMLElement => el !== null);
}
```

### 3. Hook: `use-scroll-to-line.ts`

```typescript
// hooks/use-scroll-to-line.ts

import { useEffect, useCallback, RefObject } from 'react';
import { findLineElement } from '@app/utils/line-finder';

export interface UseScrollToLineOptions {
  /** Scroll behavior */
  behavior?: ScrollBehavior;
  
  /** Block alignment */
  block?: ScrollLogicalPosition;
  
  /** Inline alignment */
  inline?: ScrollLogicalPosition;
  
  /** Delay before scrolling (ms) */
  delay?: number;
}

const DEFAULT_OPTIONS: UseScrollToLineOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'center',
  delay: 0,
};

/**
 * Hook to scroll to a specific line in a container
 */
export function useScrollToLine(
  containerRef: RefObject<HTMLElement>,
  lineNumber: number | null,
  options: UseScrollToLineOptions = {}
) {
  const { behavior, block, inline, delay } = { ...DEFAULT_OPTIONS, ...options };

  const scrollToLine = useCallback(
    (targetLine: number) => {
      const container = containerRef.current;
      if (!container) return;

      const targetEl = findLineElement(container, targetLine);
      if (!targetEl) return;

      const doScroll = () => {
        targetEl.scrollIntoView({ behavior, block, inline });
      };

      if (delay > 0) {
        setTimeout(doScroll, delay);
      } else {
        // Use rAF to ensure DOM is ready
        requestAnimationFrame(doScroll);
      }
    },
    [containerRef, behavior, block, inline, delay]
  );

  // Auto-scroll when lineNumber changes
  useEffect(() => {
    if (lineNumber !== null && lineNumber > 0) {
      scrollToLine(lineNumber);
    }
  }, [lineNumber, scrollToLine]);

  // Return manual scroll function for imperative use
  return { scrollToLine };
}
```

### 4. Hook: `use-highlight.ts`

```typescript
// hooks/use-highlight.ts

import { useEffect, useCallback, RefObject } from 'react';
import { findLineElements } from '@app/utils/line-finder';

export interface UseHighlightOptions {
  /** CSS class to add for highlight */
  className?: string;
  
  /** Duration of highlight in ms (0 = permanent) */
  duration?: number;
  
  /** Delay before adding highlight */
  delay?: number;
}

const DEFAULT_OPTIONS: UseHighlightOptions = {
  className: 'is-highlighted',
  duration: 1500,
  delay: 0,
};

/**
 * Hook to highlight specific lines
 */
export function useHighlight(
  containerRef: RefObject<HTMLElement>,
  lineNumbers: number[],
  options: UseHighlightOptions = {}
) {
  const { className, duration, delay } = { ...DEFAULT_OPTIONS, ...options };

  const highlight = useCallback(
    (lines: number[]) => {
      const container = containerRef.current;
      if (!container || lines.length === 0) return;

      const elements = findLineElements(container, lines);
      if (elements.length === 0) return;

      const addHighlight = () => {
        elements.forEach((el) => el.classList.add(className!));

        // Remove highlight after duration (if not permanent)
        if (duration > 0) {
          setTimeout(() => {
            elements.forEach((el) => el.classList.remove(className!));
          }, duration);
        }
      };

      if (delay > 0) {
        setTimeout(addHighlight, delay);
      } else {
        requestAnimationFrame(addHighlight);
      }
    },
    [containerRef, className, duration, delay]
  );

  const clearHighlight = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const highlighted = container.querySelectorAll(`.${className}`);
    highlighted.forEach((el) => el.classList.remove(className!));
  }, [containerRef, className]);

  // Auto-highlight when lineNumbers change
  useEffect(() => {
    if (lineNumbers.length > 0) {
      highlight(lineNumbers);
    }
  }, [lineNumbers, highlight]);

  return { highlight, clearHighlight };
}
```

### 5. Hook: `use-json-changes.ts`

```typescript
// hooks/use-json-changes.ts

import { useRef, useMemo } from 'react';
import { calculateJsonDiff, DiffResult } from '@app/utils/json-diff';

/**
 * Hook to track changes between JSON renders
 */
export function useJsonChanges(data: unknown): DiffResult {
  const previousRef = useRef<unknown>(null);

  const result = useMemo(() => {
    const diff = calculateJsonDiff(previousRef.current, data);
    previousRef.current = data;
    return diff;
  }, [data]);

  return result;
}
```

### 6. Component: `scrollable.tsx` (Pure Container)

```typescript
// components/scrollable/scrollable.tsx

import React, { forwardRef, PropsWithChildren, CSSProperties } from 'react';

export interface ScrollableProps extends PropsWithChildren {
  /** Height of the scrollable area */
  height?: number | string;
  
  /** Additional className */
  className?: string;
  
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Pure scrollable container - no behavior logic
 */
export const Scrollable = forwardRef<HTMLDivElement, ScrollableProps>(
  ({ children, height = '100%', className = '', style }, ref) => {
    return (
      <div
        ref={ref}
        className={`scrollable ${className}`}
        style={{
          height,
          overflow: 'auto',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);

Scrollable.displayName = 'Scrollable';
```

### 7. Component: `json-viewer.tsx` (Orchestrator)

```typescript
// components/json-viewer/json-viewer.tsx

import React, { useRef, useMemo } from 'react';
import { Scrollable } from '@app/components/scrollable/scrollable';
import { JsonSyntax } from './json-syntax';
import { useScrollToLine } from '@app/hooks/use-scroll-to-line';
import { useHighlight } from '@app/hooks/use-highlight';
import { useJsonChanges } from '@app/hooks/use-json-changes';

export interface JsonViewerProps {
  /** JSON data to display */
  data: unknown;
  
  /** Height of the viewer */
  height?: number;
  
  /** Enable auto-scroll to changes */
  autoScrollToChanges?: boolean;
  
  /** Enable highlight on changes */
  highlightChanges?: boolean;
  
  /** Highlight duration in ms */
  highlightDuration?: number;
}

/**
 * JSON Viewer - Orchestrates syntax highlighting, scrolling, and highlighting
 */
export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  height = 400,
  autoScrollToChanges = true,
  highlightChanges = true,
  highlightDuration = 1500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track changes between renders
  const { firstChange, highlightRange } = useJsonChanges(data);

  // Scroll to first change
  useScrollToLine(
    containerRef,
    autoScrollToChanges ? firstChange : null,
    { delay: 100 } // Small delay to let DOM update
  );

  // Highlight changed lines
  useHighlight(
    containerRef,
    highlightChanges ? highlightRange : [],
    { duration: highlightDuration, delay: 150 }
  );

  // Memoize JSON string
  const jsonString = useMemo(
    () => JSON.stringify(data, null, 2),
    [data]
  );

  return (
    <Scrollable ref={containerRef} height={height}>
      <JsonSyntax content={jsonString} />
    </Scrollable>
  );
};
```

---

## Summary: Where Things Live

| What | Where | Why |
|------|-------|-----|
| **Diff calculation** | `utils/json-diff.ts` | Pure function, testable, reusable |
| **Line finding** | `utils/line-finder.ts` | Pure DOM utility |
| **Scroll behavior** | `hooks/use-scroll-to-line.ts` | Stateful, reusable logic |
| **Highlight behavior** | `hooks/use-highlight.ts` | Stateful, reusable logic |
| **Change tracking** | `hooks/use-json-changes.ts` | Connects diff to React lifecycle |
| **Scroll container** | `components/scrollable.tsx` | Pure UI, no logic |
| **Syntax highlighting** | `components/json-syntax.tsx` | Wraps react-syntax-highlighter |
| **Orchestration** | `components/json-viewer.tsx` | Composes everything |

---

## Key Principles

1. **Hooks handle behavior, components handle UI**
   - Hooks: `useScrollToLine`, `useHighlight`
   - Components: `Scrollable`, `JsonViewer`

2. **Utils are pure functions**
   - No React, no side effects
   - Easy to test: `expect(calculateJsonDiff(a, b)).toEqual(...)`

3. **Scroll and Highlight are independent but composable**
   - Can scroll without highlighting
   - Can highlight without scrolling
   - `JsonViewer` combines them

4. **Single Responsibility**
   - `Scrollable` only handles scroll container
   - `useScrollToLine` only handles scroll behavior
   - `useHighlight` only handles highlight animation

---

## CSS for Highlight

```scss
// _highlight.scss

.is-highlighted {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(255, 213, 0, 0.15);
    border-left: 3px solid #ffd500;
    pointer-events: none;
    animation: highlight-fade 1.5s ease-out forwards;
  }
}

@keyframes highlight-fade {
  0% {
    background: rgba(255, 213, 0, 0.3);
  }
  100% {
    background: rgba(255, 213, 0, 0);
  }
}
```

---

## Usage

```tsx
// Simple usage - everything automatic
<JsonViewer data={data} height={500} />

// Custom control
<JsonViewer
  data={data}
  height={500}
  autoScrollToChanges={true}
  highlightChanges={true}
  highlightDuration={2000}
/>

// Manual control with hooks
const containerRef = useRef(null);
const { scrollToLine } = useScrollToLine(containerRef, null);
const { highlight, clearHighlight } = useHighlight(containerRef, []);

<Scrollable ref={containerRef}>
  <JsonSyntax content={json} />
</Scrollable>

<button onClick={() => scrollToLine(42)}>Go to line 42</button>
<button onClick={() => highlight([10, 11, 12])}>Highlight lines 10-12</button>
```


import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useVirtualScroll } from './use-virtual-scroll';

export interface VirtualListProps<T> {
    /** All items (just references, not rendered until visible) */
    items: T[];

    /** Height of each item in pixels */
    itemHeight: number;

    /** Height of the container */
    containerHeight: number;

    /** Render function for each item */
    renderItem: (item: T, index: number) => React.ReactNode;

    /** Number of items to render outside viewport (buffer) */
    overscan?: number;

    /** Key extractor for React keys */
    getKey?: (item: T, index: number) => string;

    /** Additional className for container */
    className?: string;

    /** Additional styles for container */
    style?: React.CSSProperties;
}

export interface VirtualListHandle {
    /** Scroll to a specific item index */
    scrollToIndex: (index: number) => void;
}

/**
 * Virtual List Component
 * 
 * Only renders items that are currently visible in the viewport,
 * enabling efficient rendering of lists with thousands of items.
 * 
 * @example
 * ```tsx
 * <VirtualList
 *   items={schemaKeys}
 *   itemHeight={32}
 *   containerHeight={400}
 *   renderItem={(key, index) => (
 *     <div onClick={() => selectKey(key)}>{key}</div>
 *   )}
 * />
 * ```
 */
function VirtualListInner<T>(
    {
        items,
        itemHeight,
        containerHeight,
        renderItem,
        overscan = 5,
        getKey = (_, i) => String(i),
        className = '',
        style,
    }: VirtualListProps<T>,
    ref: React.ForwardedRef<VirtualListHandle>
) {
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        totalHeight,
        startIndex,
        endIndex,
        offsetY,
        handleScroll,
        scrollToIndex,
    } = useVirtualScroll({
        itemCount: items.length,
        itemHeight,
        containerHeight,
        overscan,
    });

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
        scrollToIndex: (index: number) => scrollToIndex(index, containerRef),
    }), [scrollToIndex]);

    // Get visible items slice
    const visibleItems = useMemo(
        () => items.slice(startIndex, endIndex + 1),
        [items, startIndex, endIndex]
    );

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`virtual-list ${className}`}
            style={{
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
                ...style,
            }}
        >
            {/* Spacer to maintain scroll height */}
            <div
                className="virtual-list__spacer"
                style={{
                    height: totalHeight,
                    position: 'relative',
                }}
            >
                {/* Positioned container for visible items */}
                <div
                    className="virtual-list__items"
                    style={{
                        position: 'absolute',
                        top: offsetY,
                        left: 0,
                        right: 0,
                    }}
                >
                    {visibleItems.map((item, i) => {
                        const actualIndex = startIndex + i;
                        return (
                            <div
                                key={getKey(item, actualIndex)}
                                className="virtual-list__item"
                                style={{ height: itemHeight }}
                            >
                                {renderItem(item, actualIndex)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Wrapper to support generics with forwardRef
export const VirtualList = forwardRef(VirtualListInner) as <T>(
    props: VirtualListProps<T> & { ref?: React.ForwardedRef<VirtualListHandle> }
) => React.ReactElement;

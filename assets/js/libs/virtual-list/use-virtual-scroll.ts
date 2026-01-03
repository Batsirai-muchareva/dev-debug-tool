import { useState, useCallback, useMemo, RefObject } from 'react';

export interface VirtualScrollState {
    /** Current scroll position */
    scrollTop: number;
    
    /** Start index of visible items */
    startIndex: number;
    
    /** End index of visible items */
    endIndex: number;
    
    /** Offset for positioning visible items */
    offsetY: number;
}

export interface UseVirtualScrollOptions {
    /** Total number of items */
    itemCount: number;
    
    /** Height of each item in pixels */
    itemHeight: number;
    
    /** Height of the container in pixels */
    containerHeight: number;
    
    /** Number of items to render outside viewport (buffer) */
    overscan?: number;
}

export interface UseVirtualScrollReturn extends VirtualScrollState {
    /** Total height of all items (for scroll container) */
    totalHeight: number;
    
    /** Number of visible items */
    visibleCount: number;
    
    /** Handle scroll event */
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    
    /** Scroll to a specific item index */
    scrollToIndex: (index: number, containerRef: RefObject<HTMLElement>) => void;
}

/**
 * Hook for virtual scrolling calculations
 * 
 * Calculates which items should be visible based on scroll position,
 * enabling efficient rendering of large lists.
 */
export function useVirtualScroll({
    itemCount,
    itemHeight,
    containerHeight,
    overscan = 5,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
    const [scrollTop, setScrollTop] = useState(0);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const scrollToIndex = useCallback(
        (index: number, containerRef: RefObject<HTMLElement>) => {
            if (!containerRef.current) return;
            
            const targetScrollTop = index * itemHeight;
            containerRef.current.scrollTop = targetScrollTop;
            setScrollTop(targetScrollTop);
        },
        [itemHeight]
    );

    const computed = useMemo(() => {
        const totalHeight = itemCount * itemHeight;
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        
        // Calculate visible range with overscan
        const rawStartIndex = Math.floor(scrollTop / itemHeight);
        const startIndex = Math.max(0, rawStartIndex - overscan);
        const endIndex = Math.min(
            itemCount - 1,
            rawStartIndex + visibleCount + overscan
        );
        
        // Offset for positioning the visible items
        const offsetY = startIndex * itemHeight;

        return {
            totalHeight,
            visibleCount,
            startIndex,
            endIndex,
            offsetY,
        };
    }, [itemCount, itemHeight, containerHeight, scrollTop, overscan]);

    return {
        scrollTop,
        ...computed,
        handleScroll,
        scrollToIndex,
    };
}

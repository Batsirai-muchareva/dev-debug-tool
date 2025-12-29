/**
 * EventBus - Typed event system
 * 
 * Replaces loose custom DOM events with a typed, centralized event system.
 * 
 * Benefits:
 * - Compile-time type checking for events
 * - Centralized event documentation
 * - Support for event replay (late subscribers get last value)
 * - Easier to debug and test
 * 
 * @example
 * ```typescript
 * import { eventBus } from '@app/events/event-bus';
 * 
 * // Subscribe to an event
 * const unsubscribe = eventBus.on('element:selected', (payload) => {
 *   console.log('Element selected:', payload.elementId);
 *   // TypeScript knows payload has elementId and data properties
 * });
 * 
 * // Emit an event
 * eventBus.emit('element:selected', {
 *   elementId: '123',
 *   data: { ... },
 * });
 * 
 * // Cleanup
 * unsubscribe();
 * ```
 */

// =============================================================================
// Event Type Definitions
// =============================================================================

/**
 * Map of all event types and their payloads
 * Add new events here to get type safety throughout the codebase
 */
export interface EventMap {
  // Element events
  'element:selected': {
    elementId: string;
    data: Record<string, unknown>;
  };
  'element:deselected': void;
  'element:updated': {
    elementId: string;
    changes: Record<string, unknown>;
  };

  // Data events
  'data:updated': {
    providerId: string;
    data: unknown;
  };
  'data:loading': {
    providerId: string;
  };
  'data:error': {
    providerId: string;
    error: {
      code: string;
      message: string;
    };
  };

  // Popover events
  'popover:opened': {
    popoverId: string;
  };
  'popover:closed': {
    popoverId: string;
  };
  'popover:moved': {
    popoverId: string;
    position: { x: number; y: number };
  };
  'popover:resized': {
    popoverId: string;
    size: { width: number; height: number };
  };

  // Tab events
  'tab:changed': {
    tabId: string;
    previousTabId: string;
  };
  'subtab:changed': {
    tabId: string;
    subTabId: string;
    previousSubTabId: string;
  };

  // Filter events
  'filter:changed': {
    path: string;
    previousPath: string;
  };
  'suggestion:selected': {
    path: string;
    value: unknown;
  };

  // Document events
  'document:saved': {
    documentId: string;
    timestamp: number;
  };

  // Cache events (for debugging)
  'cache:hit': {
    key: string;
    age: number;
  };
  'cache:miss': {
    key: string;
  };
  'cache:evict': {
    key: string;
    reason: 'lru' | 'ttl' | 'manual';
  };
}

// =============================================================================
// Types
// =============================================================================

export type EventName = keyof EventMap;
export type EventPayload<E extends EventName> = EventMap[E];
export type EventHandler<E extends EventName> = (payload: EventPayload<E>) => void;
export type Unsubscribe = () => void;

interface EventBusOptions {
  /**
   * Enable event replay for late subscribers
   * When true, new subscribers immediately receive the last emitted value
   */
  enableReplay?: boolean;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Maximum number of events to keep in history (for debugging)
   */
  historySize?: number;
}

interface EventBus {
  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<E extends EventName>(event: E, handler: EventHandler<E>): Unsubscribe;

  /**
   * Subscribe to an event, but only fire once
   */
  once<E extends EventName>(event: E, handler: EventHandler<E>): void;

  /**
   * Emit an event
   */
  emit<E extends EventName>(event: E, payload: EventPayload<E>): void;

  /**
   * Remove all listeners for an event
   */
  off<E extends EventName>(event: E): void;

  /**
   * Remove all listeners for all events
   */
  offAll(): void;

  /**
   * Get the number of listeners for an event
   */
  listenerCount<E extends EventName>(event: E): number;

  /**
   * Get event history (for debugging)
   */
  getHistory(): Array<{ event: string; payload: unknown; timestamp: number }>;

  /**
   * Clear event history
   */
  clearHistory(): void;
}

// =============================================================================
// Implementation
// =============================================================================

export function createEventBus(options: EventBusOptions = {}): EventBus {
  const {
    enableReplay = false,
    debug = false,
    historySize = 100,
  } = options;

  // Storage for event listeners
  const listeners = new Map<EventName, Set<EventHandler<EventName>>>();

  // Last emitted value for each event (for replay)
  const lastValues = new Map<EventName, unknown>();

  // Event history for debugging
  const history: Array<{ event: string; payload: unknown; timestamp: number }> = [];

  /**
   * Log debug messages
   */
  const log = (message: string, ...args: unknown[]) => {
    if (debug) {
      console.debug(`[EventBus] ${message}`, ...args);
    }
  };

  /**
   * Get or create listener set for an event
   */
  const getListeners = <E extends EventName>(event: E): Set<EventHandler<E>> => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    return listeners.get(event) as Set<EventHandler<E>>;
  };

  /**
   * Subscribe to an event
   */
  const on = <E extends EventName>(
    event: E,
    handler: EventHandler<E>
  ): Unsubscribe => {
    const eventListeners = getListeners(event);
    eventListeners.add(handler as EventHandler<EventName>);
    
    log(`Subscribed to "${event}" (${eventListeners.size} listeners)`);

    // Replay last value if enabled
    if (enableReplay && lastValues.has(event)) {
      const lastValue = lastValues.get(event) as EventPayload<E>;
      log(`Replaying last value for "${event}"`, lastValue);
      
      // Use setTimeout to ensure it's async like a real event
      setTimeout(() => handler(lastValue), 0);
    }

    return () => {
      eventListeners.delete(handler as EventHandler<EventName>);
      log(`Unsubscribed from "${event}" (${eventListeners.size} listeners)`);
    };
  };

  /**
   * Subscribe once
   */
  const once = <E extends EventName>(
    event: E,
    handler: EventHandler<E>
  ): void => {
    const wrappedHandler: EventHandler<E> = (payload) => {
      // Remove before calling to prevent re-entry issues
      getListeners(event).delete(wrappedHandler as EventHandler<EventName>);
      handler(payload);
    };

    getListeners(event).add(wrappedHandler as EventHandler<EventName>);
    log(`Subscribed once to "${event}"`);
  };

  /**
   * Emit an event
   */
  const emit = <E extends EventName>(
    event: E,
    payload: EventPayload<E>
  ): void => {
    log(`Emitting "${event}"`, payload);

    // Store last value for replay
    if (enableReplay) {
      lastValues.set(event, payload);
    }

    // Add to history
    history.push({
      event,
      payload,
      timestamp: Date.now(),
    });

    // Trim history if too large
    while (history.length > historySize) {
      history.shift();
    }

    // Notify listeners
    const eventListeners = getListeners(event);
    eventListeners.forEach((handler) => {
      try {
        (handler as EventHandler<E>)(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${event}":`, error);
      }
    });
  };

  /**
   * Remove all listeners for an event
   */
  const off = <E extends EventName>(event: E): void => {
    listeners.delete(event);
    log(`Removed all listeners for "${event}"`);
  };

  /**
   * Remove all listeners
   */
  const offAll = (): void => {
    listeners.clear();
    lastValues.clear();
    log('Removed all listeners');
  };

  /**
   * Get listener count
   */
  const listenerCount = <E extends EventName>(event: E): number => {
    return getListeners(event).size;
  };

  /**
   * Get event history
   */
  const getHistory = () => [...history];

  /**
   * Clear history
   */
  const clearHistory = () => {
    history.length = 0;
  };

  return {
    on,
    once,
    emit,
    off,
    offAll,
    listenerCount,
    getHistory,
    clearHistory,
  };
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Global event bus instance
 * 
 * Enable debug mode during development:
 * ```typescript
 * // In development
 * export const eventBus = createEventBus({ debug: true, enableReplay: true });
 * ```
 */
export const eventBus = createEventBus({
  debug: process.env.NODE_ENV === 'development',
  enableReplay: true,
  historySize: 50,
});

// =============================================================================
// React Hook
// =============================================================================

/**
 * React hook for subscribing to events
 * 
 * @example
 * ```tsx
 * import { useEventBus } from '@app/events/event-bus';
 * 
 * function Component() {
 *   useEventBus('element:selected', (payload) => {
 *     console.log('Selected:', payload.elementId);
 *   });
 * 
 *   return <div>...</div>;
 * }
 * ```
 */
export function useEventBus<E extends EventName>(
  event: E,
  handler: EventHandler<E>,
  deps: unknown[] = []
) {
  // Note: This would need React imported
  // import { useEffect, useCallback } from 'react';
  
  // const stableHandler = useCallback(handler, deps);
  
  // useEffect(() => {
  //   return eventBus.on(event, stableHandler);
  // }, [event, stableHandler]);
  
  // Placeholder implementation - actual implementation would use React hooks
  return eventBus.on(event, handler);
}



export interface SourcePromise {
    getData: () => Promise<any>;
}

export interface SourceSubscription {
    getData: () => any;
    subscribe: (callback: (data: any) => void) => void;
    destroy?: () => void; // Optional cleanup method
}

export type SourceGetter =
    | ( () => SourcePromise )                    // Async pattern (database)
    | ( () => SourceSubscription );              // Subscription pattern (editor)

export type SourceProvider = {
    key: string;
    label: string;
    priority: number;
    canGetData: () => boolean;
    emptyMessage?: string;
    actions: {
        get?: () => any; // get the schema (optional), // subscribe to schema updates (optional)
        // subscribe?: () => SourceSubscription;
        subscribe?: (callback: (data: any) => void) => void;

        initializeListeners?: ( callback: () => void ) => void;
    }
}

export function createSourceProvider( {
    key,
    label,
    canGetData,
    emptyMessage,
    priority,
    actions
}: SourceProvider ) {
    return {
        key,
        label,
        canGetData,
        emptyMessage,
        priority,
        actions: {
            get: actions.get,
            subscribe: actions.subscribe,
            initializeListeners: actions.initializeListeners,
        }
    }
}

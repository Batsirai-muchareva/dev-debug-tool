export type Data = {
    id: string;
    elType: string;
    widgetType: string;
    settings: Record<string, unknown>;
    elements: Record<string, unknown>[];
    styles: Record<string, unknown>;
};

export type CleanupFn = () => void;
export type UpdateSnapshotFn = ( key: string, state: SourceState ) => void;

export type SourceHandler = ( provider: SourceProvider, updateSnapshot: UpdateSnapshotFn ) => CleanupFn;

export type SourceProviderActions =
    | { type: 'subscription'; subscribe: ( onUpdate: ( data: Data ) => void, onIdle: () => void ) => CleanupFn }
    | { type: 'promise'; fetch: () => Promise<Data> }
    | { type: 'value'; getValue: () => Data };

export type SourceProvider = {
    key: string;
    label: string;
    idleMessage?: string;
    actions: SourceProviderActions;
    lifecycle?: {
        onMount?: ( refetch: () => void ) => CleanupFn;
        onUnmount?: () => void;
    };
};

type SourceState<T = Data> =
    | { status: 'idle', message: string }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: string };

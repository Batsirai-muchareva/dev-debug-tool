
export type Notify<T> = (data: T | null) => void;

export type Unsubscribe = () => void;

export type Callback<T = any, R = void> = ( data?: T ) => R;

export type DataSourceFactory<T = unknown, C = unknown> = ( config: C) => DataSource<T>;

export interface DataSource<T = unknown> {
    start( notify: Notify<T> ): void;
    stop(): void;
    refresh?(): Promise<void>;
}

interface VariantConfig {
    id: string;
    label: string;
    order?: number;
    icon?: string;
    description?: string;

    shouldShowData?: (data: unknown | null) => boolean;
    getEmptyMessage?: (data: unknown | null) => string;
}

export interface Variant<T = unknown, C = unknown> extends VariantConfig {
    sourceConfig: C;
    createSource: DataSourceFactory<T, C>;
}

export interface Provider<T = unknown, C = unknown> {
    id: string;
    title: string;
    order?: number;
    getMessage?: ( data: T | null ) => string;
    shouldShowData?: ( data: T | null ) => boolean;
    variants: Variant<T, C>[];
}

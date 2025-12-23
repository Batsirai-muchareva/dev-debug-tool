export type UnknownData = unknown;

export type Callback<T = UnknownData, R = void> = ( data?: T ) => R;

export interface DataProvider {
    id: string;
    title: string;
    get?: () => Promise< UnknownData >;
    subscribe: ( cb: Callback ) => Callback;
    getMessage: Callback< UnknownData, string>;
    order?: number;
    shouldShowData?: Callback< UnknownData, boolean > ;
    variants?: Record<string, any & { label: string }>;
}

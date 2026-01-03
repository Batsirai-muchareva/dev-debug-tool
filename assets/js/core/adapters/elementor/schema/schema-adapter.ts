/**
 * Schema Adapter
 * 
 * Provides access to Elementor's style schema without loading
 * all data into memory at once. Uses lazy loading and caching
 * for optimal performance with large schema objects.
 */

interface StyleSchema {
    [key: string]: unknown;
}

export interface SchemaAdapter {
    /** Get all schema keys (just the keys, not the data) */
    getKeys(): string[];

    /** Get schema for a specific key */
    getSchema(key: string): unknown | null;

    /** Search keys by query */
    searchKeys(query: string): string[];

    /** Get total count of schemas */
    getCount(): number;

    /** Check if schema is available */
    isAvailable(): boolean;
}

interface ExtendedWindow extends Window {
    elementor?: {
        config?: {
            atomic?: {
                styles_schema?: StyleSchema;
            };
        };
    };
}

const createSchemaAdapter = (): SchemaAdapter => {
    // Cache references (don't copy the data)
    let schemaRef: StyleSchema | null = null;
    let keysCache: string[] | null = null;

    const getSchemaRef = (): StyleSchema => {
        if (!schemaRef) {
            const extendedWindow = window as unknown as ExtendedWindow;
            schemaRef = extendedWindow.elementor?.config?.atomic?.styles_schema ?? {};
        }
        return schemaRef;
    };

    const getKeysCache = (): string[] => {
        if (!keysCache) {
            keysCache = Object.keys(getSchemaRef());
        }
        return keysCache;
    };

    return {
        getKeys: () => getKeysCache(),

        getSchema: (key: string) => {
            const schema = getSchemaRef();
            return schema[key] ?? null;
        },

        searchKeys: (query: string) => {
            const keys = getKeysCache();
            
            if (!query.trim()) {
                return keys;
            }

            const lowerQuery = query.toLowerCase();
            return keys.filter((key) =>
                key.toLowerCase().includes(lowerQuery)
            );
        },

        getCount: () => getKeysCache().length,

        isAvailable: () => {
            const extendedWindow = window as unknown as ExtendedWindow;
            return Boolean(extendedWindow.elementor?.config?.atomic?.styles_schema);
        },
    };
};

export const schemaAdapter = createSchemaAdapter();

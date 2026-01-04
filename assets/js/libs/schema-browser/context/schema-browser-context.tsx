import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    PropsWithChildren,
} from 'react';
import {
    SchemaDataSource,
    SchemaNavigationState,
    SchemaSearchState,
    SchemaView,
} from '../types';

/**
 * Combined context for schema browser state
 */
interface SchemaBrowserContextState {
    navigation: SchemaNavigationState;
    search: SchemaSearchState;
    dataSource: SchemaDataSource;
}

const SchemaBrowserContext = createContext<SchemaBrowserContextState | null>(null);

interface SchemaBrowserProviderProps extends PropsWithChildren {
    dataSource: SchemaDataSource;
}

/**
 * Schema Browser Provider
 * 
 * Provides navigation and search state for the schema browser.
 * Data source is injected, keeping the library decoupled from specific data.
 */
export const SchemaBrowserProvider: React.FC<SchemaBrowserProviderProps> = ({
    dataSource,
    children,
}) => {
    // Navigation state
    const [view, setView] = useState<SchemaView>('list');
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    // Search state
    const [query, setQueryState] = useState('');

    // Navigation actions
    const selectKey = useCallback((key: string) => {
        setSelectedKey(key);
        setView('detail');
    }, []);

    const goBack = useCallback(() => {
        setSelectedKey(null);
        setView('list');
    }, []);

    const isSelected = useCallback(
        (key: string) => selectedKey === key,
        [selectedKey]
    );

    // Search actions
    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery);
    }, []);

    const clearQuery = useCallback(() => {
        setQueryState('');
    }, []);

    // Filtered keys (use dataSource.searchKeys if available)
    const filteredKeys = useMemo(() => {
        if (dataSource.searchKeys) {
            return dataSource.searchKeys(query);
        }

        // Default search implementation
        const keys = dataSource.getKeys();
        if (!query.trim()) {
            return keys;
        }

        const lowerQuery = query.toLowerCase();
        return keys.filter((key) => key.toLowerCase().includes(lowerQuery));
    }, [dataSource, query]);

    const totalCount = useMemo(() => dataSource.getCount(), [dataSource]);
    const isSearching = query.trim().length > 0;

    // Build context value
    const value = useMemo<SchemaBrowserContextState>(
        () => ({
            navigation: {
                view,
                selectedKey,
                selectKey,
                goBack,
                isSelected,
            },
            search: {
                query,
                setQuery,
                clearQuery,
                filteredKeys,
                totalCount,
                isSearching,
            },
            dataSource,
        }),
        [
            view,
            selectedKey,
            selectKey,
            goBack,
            isSelected,
            query,
            setQuery,
            clearQuery,
            filteredKeys,
            totalCount,
            isSearching,
            dataSource,
        ]
    );

    return (
        <SchemaBrowserContext.Provider value={value}>
            {children}
        </SchemaBrowserContext.Provider>
    );
};

/**
 * Hook to access schema browser context
 */
export const useSchemaBrowser = (): SchemaBrowserContextState => {
    const context = useContext(SchemaBrowserContext);

    if (!context) {
        throw new Error(
            'useSchemaBrowser must be used within a SchemaBrowserProvider'
        );
    }

    return context;
};

/**
 * Hook for navigation state only
 */
export const useSchemaNavigation = (): SchemaNavigationState => {
    const { navigation } = useSchemaBrowser();
    return navigation;
};

/**
 * Hook for search state only
 */
export const useSchemaSearch = (): SchemaSearchState => {
    const { search } = useSchemaBrowser();
    return search;
};

/**
 * Hook for data source
 */
export const useSchemaDataSource = (): SchemaDataSource => {
    const { dataSource } = useSchemaBrowser();
    return dataSource;
};

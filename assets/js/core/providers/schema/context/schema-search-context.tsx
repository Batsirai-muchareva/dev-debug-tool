import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
    PropsWithChildren,
} from 'react';
import { schemaAdapter } from '@app/adapters/elementor/schema';

interface SchemaSearchState {
    /** Current search query */
    query: string;
    
    /** Update search query */
    setQuery: (query: string) => void;
    
    /** Clear search query */
    clearQuery: () => void;
    
    /** Filtered keys based on search query */
    filteredKeys: string[];
    
    /** Total number of schemas (unfiltered) */
    totalCount: number;
    
    /** Whether search is active */
    isSearching: boolean;
}

const SchemaSearchContext = createContext<SchemaSearchState | null>(null);

/**
 * Schema Search Provider
 * 
 * Manages search state for filtering schema keys.
 * Search is performed on keys only (not schema content) for performance.
 */
export const SchemaSearchProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [query, setQueryState] = useState('');

    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery);
    }, []);

    const clearQuery = useCallback(() => {
        setQueryState('');
    }, []);

    const filteredKeys = useMemo(
        () => schemaAdapter.searchKeys(query),
        [query]
    );

    const totalCount = useMemo(
        () => schemaAdapter.getCount(),
        []
    );

    const isSearching = query.trim().length > 0;

    const value = useMemo<SchemaSearchState>(
        () => ({
            query,
            setQuery,
            clearQuery,
            filteredKeys,
            totalCount,
            isSearching,
        }),
        [query, setQuery, clearQuery, filteredKeys, totalCount, isSearching]
    );

    return (
        <SchemaSearchContext.Provider value={value}>
            {children}
        </SchemaSearchContext.Provider>
    );
};

/**
 * Hook to access schema search state
 * 
 * @throws Error if used outside SchemaSearchProvider
 */
export const useSchemaSearch = (): SchemaSearchState => {
    const context = useContext(SchemaSearchContext);
    
    if (!context) {
        throw new Error(
            'useSchemaSearch must be used within a SchemaSearchProvider'
        );
    }
    
    return context;
};

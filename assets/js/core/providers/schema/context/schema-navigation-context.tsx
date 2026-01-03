import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    PropsWithChildren,
} from 'react';

type SchemaView = 'list' | 'detail';

interface SchemaNavigationState {
    /** Current view mode */
    view: SchemaView;
    
    /** Currently selected schema key (null when in list view) */
    selectedKey: string | null;
    
    /** Navigate to detail view for a specific key */
    selectKey: (key: string) => void;
    
    /** Navigate back to list view */
    goBack: () => void;
    
    /** Check if currently viewing a specific key */
    isSelected: (key: string) => boolean;
}

const SchemaNavigationContext = createContext<SchemaNavigationState | null>(null);

/**
 * Schema Navigation Provider
 * 
 * Manages navigation state for the schema viewer:
 * - List view: Shows all schema keys
 * - Detail view: Shows the selected schema's content
 */
export const SchemaNavigationProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [view, setView] = useState<SchemaView>('list');
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

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

    const value = useMemo<SchemaNavigationState>(
        () => ({
            view,
            selectedKey,
            selectKey,
            goBack,
            isSelected,
        }),
        [view, selectedKey, selectKey, goBack, isSelected]
    );

    return (
        <SchemaNavigationContext.Provider value={value}>
            {children}
        </SchemaNavigationContext.Provider>
    );
};

/**
 * Hook to access schema navigation state
 * 
 * @throws Error if used outside SchemaNavigationProvider
 */
export const useSchemaNavigation = (): SchemaNavigationState => {
    const context = useContext(SchemaNavigationContext);
    
    if (!context) {
        throw new Error(
            'useSchemaNavigation must be used within a SchemaNavigationProvider'
        );
    }
    
    return context;
};

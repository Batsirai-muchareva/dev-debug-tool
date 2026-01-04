/**
 * Schema Browser Types
 * 
 * Generic types for browsing large key-value data structures.
 * The library is data-agnostic - data is injected via SchemaDataSource.
 */

/**
 * Data source interface for the schema browser.
 * Implement this to connect any key-value data structure.
 */
export interface SchemaDataSource {
    /** Get all available keys */
    getKeys(): string[];

    /** Get data for a specific key */
    getData(key: string): unknown | null;

    /** Search keys by query (optional - defaults to simple includes) */
    searchKeys?(query: string): string[];

    /** Get total count of items */
    getCount(): number;

    /** Check if data source is available/ready */
    isAvailable(): boolean;
}

/**
 * Navigation view state
 */
export type SchemaView = 'list' | 'detail';

/**
 * Navigation state for the browser
 */
export interface SchemaNavigationState {
    view: SchemaView;
    selectedKey: string | null;
    selectKey: (key: string) => void;
    goBack: () => void;
    isSelected: (key: string) => boolean;
}

/**
 * Search state for filtering keys
 */
export interface SchemaSearchState {
    query: string;
    setQuery: (query: string) => void;
    clearQuery: () => void;
    filteredKeys: string[];
    totalCount: number;
    isSearching: boolean;
}

/**
 * Props for the main SchemaBrowser component
 */
export interface SchemaBrowserProps {
    /** Data source for keys and values */
    dataSource: SchemaDataSource;

    /** Optional custom renderer for list items */
    renderListItem?: (key: string, index: number, onClick: () => void) => React.ReactNode;

    /** Optional custom renderer for detail view */
    renderDetail?: (key: string, data: unknown) => React.ReactNode;

    /** Item height for virtual list (default: 32) */
    itemHeight?: number;

    /** Placeholder text for search input */
    searchPlaceholder?: string;

    /** Label for "items" (e.g., "schemas", "properties") */
    itemLabel?: string;
}

/**
 * Props for list item component
 */
export interface SchemaListItemProps {
    schemaKey: string;
    index: number;
    onClick: () => void;
    isSelected?: boolean;
}

import React from 'react';
import { useSchemaSearch } from '../context/schema-browser-context';

interface SchemaSearchProps {
    placeholder?: string;
}

/**
 * Schema Search Input
 * 
 * Search input for filtering keys.
 */
export const SchemaSearch: React.FC<SchemaSearchProps> = ({
    placeholder = 'Search...',
}) => {
    const { query, setQuery, clearQuery, isSearching } = useSchemaSearch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            clearQuery();
        }
    };

    return (
        <div className="schema-browser__search">
            <input
                type="text"
                className="schema-browser__search-input"
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
            />
            {isSearching && (
                <button
                    className="schema-browser__search-clear"
                    onClick={clearQuery}
                    type="button"
                    title="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

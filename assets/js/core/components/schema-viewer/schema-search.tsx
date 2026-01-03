import React from 'react';
import { useSchemaSearch } from '@app/providers/schema/context';
import { bemBlock } from '@app/utils/bem';

const bem = bemBlock.element('schema-search');

/**
 * Schema Search Input
 * 
 * Search input for filtering schema keys.
 * Connected to SchemaSearchContext.
 */
export const SchemaSearch: React.FC = () => {
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
        <div className={bem}>
            <input
                type="text"
                className={`${bem}__input`}
                placeholder="Search schemas..."
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
            />
            {isSearching && (
                <button
                    className={`${bem}__clear`}
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

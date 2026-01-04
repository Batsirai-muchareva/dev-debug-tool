import React, { memo } from 'react';
import { SchemaListItemProps } from '../types';

/**
 * Schema List Item
 * 
 * A single clickable row in the schema list.
 * Memoized to prevent unnecessary re-renders in the virtual list.
 */
export const SchemaListItem = memo<SchemaListItemProps>(({
    schemaKey,
    index,
    onClick,
    isSelected = false,
}) => {
    return (
        <button
            className={`schema-browser__list-item ${isSelected ? 'is-selected' : ''}`}
            onClick={onClick}
            type="button"
            title={schemaKey}
        >
            <span className="schema-browser__list-item-index">
                {index + 1}
            </span>
            <span className="schema-browser__list-item-key">
                {schemaKey}
            </span>
            <span className="schema-browser__list-item-arrow">
                →
            </span>
        </button>
    );
});

SchemaListItem.displayName = 'SchemaListItem';

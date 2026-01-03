import React, { memo } from 'react';
import { bemBlock } from '@app/utils/bem';

interface SchemaListItemProps {
    /** Schema key to display */
    schemaKey: string;
    
    /** Index in the list (for display) */
    index: number;
    
    /** Click handler */
    onClick: () => void;
    
    /** Whether this item is currently selected */
    isSelected?: boolean;
}

const bem = bemBlock.element('schema-list-item');

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
            className={`${bem} ${isSelected ? 'is-selected' : ''}`}
            onClick={onClick}
            type="button"
            title={schemaKey}
        >
            <span className={`${bem}__index`}>
                {index + 1}
            </span>
            <span className={`${bem}__key`}>
                {schemaKey}
            </span>
            <span className={`${bem}__arrow`}>
                →
            </span>
        </button>
    );
});

SchemaListItem.displayName = 'SchemaListItem';

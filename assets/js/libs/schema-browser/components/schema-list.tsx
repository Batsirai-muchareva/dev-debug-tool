import React, { useRef } from 'react';
import { VirtualList, VirtualListHandle } from '@libs/virtual-list';
import { useSchemaSearch, useSchemaNavigation } from '../context/schema-browser-context';
import { SchemaSearch } from './schema-search';
import { SchemaListItem } from './schema-list-item';
import { SchemaListItemProps } from '../types';

interface SchemaListProps {
    /** Height of the list container */
    containerHeight: number;

    /** Height of each item (default: 32) */
    itemHeight?: number;

    /** Search placeholder */
    searchPlaceholder?: string;

    /** Label for items (e.g., "schemas") */
    itemLabel?: string;

    /** Custom item renderer */
    renderItem?: (props: SchemaListItemProps) => React.ReactNode;
}

/**
 * Schema List
 * 
 * Virtualized list of keys with search.
 * Only renders visible items for optimal performance.
 */
export const SchemaList: React.FC<SchemaListProps> = ({
    containerHeight,
    itemHeight = 32,
    searchPlaceholder = 'Search...',
    itemLabel = 'items',
    renderItem,
}) => {
    const listRef = useRef<VirtualListHandle>(null);
    const { filteredKeys, totalCount, isSearching } = useSchemaSearch();
    const { selectKey, isSelected } = useSchemaNavigation();

    const handleItemClick = (key: string) => {
        selectKey(key);
    };

    // Calculate list height (subtract search and header)
    const listHeight = Math.max(100, containerHeight - 80);

    return (
        <div className="schema-browser__list">
            <SchemaSearch placeholder={searchPlaceholder} />

            <div className="schema-browser__list-header">
                <span className="schema-browser__list-count">
                    {isSearching ? (
                        <>
                            <strong>{filteredKeys.length}</strong> of {totalCount} {itemLabel}
                        </>
                    ) : (
                        <>
                            <strong>{totalCount}</strong> {itemLabel}
                        </>
                    )}
                </span>
            </div>

            {filteredKeys.length === 0 ? (
                <div className="schema-browser__list-empty">
                    {isSearching
                        ? `No ${itemLabel} match your search`
                        : `No ${itemLabel} available`}
                </div>
            ) : (
                <VirtualList
                    ref={listRef}
                    items={filteredKeys}
                    itemHeight={itemHeight}
                    containerHeight={listHeight}
                    getKey={(key) => key}
                    className="schema-browser__virtual-list"
                    renderItem={(key, index) => {
                        const props: SchemaListItemProps = {
                            schemaKey: key,
                            index,
                            onClick: () => handleItemClick(key),
                            isSelected: isSelected(key),
                        };

                        return renderItem ? renderItem(props) : <SchemaListItem {...props} />;
                    }}
                />
            )}
        </div>
    );
};

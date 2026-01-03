import React, { useRef } from 'react';
import { VirtualList, VirtualListHandle } from '@libs/virtual-list';
import { useSchemaSearch } from '@app/providers/schema/context';
import { useSchemaNavigation } from '@app/providers/schema/context';
import { useBounds } from '@app/context/bounds-context';
import { SchemaSearch } from './schema-search';
import { SchemaListItem } from './schema-list-item';
import { bemBlock } from '@app/utils/bem';

const ITEM_HEIGHT = 32;
const HEADER_HEIGHT = 100; // Search + header + padding

const bem = bemBlock.element('schema-list');

/**
 * Schema List
 * 
 * Virtualized list of schema keys with search.
 * Only renders visible items for optimal performance.
 */
export const SchemaList: React.FC = () => {
    const listRef = useRef<VirtualListHandle>(null);
    const { filteredKeys, totalCount, isSearching } = useSchemaSearch();
    const { selectKey, isSelected } = useSchemaNavigation();
    const { size } = useBounds();

    const containerHeight = Math.max(200, size.height - HEADER_HEIGHT - 180);

    const handleItemClick = (key: string) => {
        selectKey(key);
    };

    return (
        <div className={bem}>
            <SchemaSearch />

            <div className={`${bem}__header`}>
                <span className={`${bem}__count`}>
                    {isSearching ? (
                        <>
                            <strong>{filteredKeys.length}</strong> of {totalCount} schemas
                        </>
                    ) : (
                        <>
                            <strong>{totalCount}</strong> schemas
                        </>
                    )}
                </span>
            </div>

            {filteredKeys.length === 0 ? (
                <div className={`${bem}__empty`}>
                    {isSearching
                        ? 'No schemas match your search'
                        : 'No schemas available'}
                </div>
            ) : (
                <VirtualList
                    ref={listRef}
                    items={filteredKeys}
                    itemHeight={ITEM_HEIGHT}
                    containerHeight={containerHeight}
                    getKey={(key) => key}
                    className={`${bem}__virtual`}
                    renderItem={(key, index) => (
                        <SchemaListItem
                            schemaKey={key}
                            index={index}
                            onClick={() => handleItemClick(key)}
                            isSelected={isSelected(key)}
                        />
                    )}
                />
            )}
        </div>
    );
};

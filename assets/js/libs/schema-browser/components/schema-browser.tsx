import React from 'react';
import { SchemaBrowserProvider, useSchemaNavigation } from '../context/schema-browser-context';
import { SchemaList } from './schema-list';
import { SchemaDetail } from './schema-detail';
import { SchemaBrowserProps, SchemaListItemProps } from '../types';

interface SchemaBrowserContentProps {
    containerHeight: number;
    itemHeight?: number;
    searchPlaceholder?: string;
    itemLabel?: string;
    renderListItem?: (props: SchemaListItemProps) => React.ReactNode;
    renderDetail?: (key: string, data: unknown) => React.ReactNode;
}

/**
 * Schema Browser Content
 *
 * Switches between list and detail views based on navigation state.
 */
const SchemaBrowserContent: React.FC<SchemaBrowserContentProps> = ({
    containerHeight,
    itemHeight,
    searchPlaceholder,
    itemLabel,
    renderListItem,
    renderDetail,
}) => {
    const { view } = useSchemaNavigation();

    return (
        <div className="schema-browser">
            {view === 'list' ? (
                <SchemaList
                    containerHeight={containerHeight}
                    itemHeight={itemHeight}
                    searchPlaceholder={searchPlaceholder}
                    itemLabel={itemLabel}
                    renderItem={renderListItem}
                />
            ) : (
                <SchemaDetail
                    containerHeight={containerHeight}
                    renderContent={renderDetail}
                />
            )}
        </div>
    );
};

interface FullSchemaBrowserProps extends SchemaBrowserProps {
    /** Height of the browser container */
    containerHeight: number;
}

/**
 * Schema Browser
 *
 * A generic, virtualized browser for large key-value data structures.
 *
 * Features:
 * - Virtualized list for performance (handles thousands of items)
 * - Search/filter on keys
 * - Lazy loading of detail data
 * - Clean list → detail navigation
 *
 * @example
 * ```tsx
 * // Create a data source
 * const dataSource: SchemaDataSource = {
 *   getKeys: () => Object.keys(myData),
 *   getData: (key) => myData[key],
 *   getCount: () => Object.keys(myData).length,
 *   isAvailable: () => true,
 * };
 *
 * // Use the browser
 * <SchemaBrowser
 *   dataSource={dataSource}
 *   containerHeight={400}
 *   itemLabel="schemas"
 * />
 * ```
 */
export const SchemaBrowser: React.FC<FullSchemaBrowserProps> = ({
    dataSource,
    containerHeight,
    itemHeight = 32,
    searchPlaceholder = 'Search...',
    itemLabel = 'items',
    renderListItem,
    renderDetail,
}) => {
    if (!dataSource.isAvailable()) {
        return (
            <div className="schema-browser schema-browser--unavailable">
                <div className="schema-browser__unavailable-message">
                    Data source not available
                </div>
            </div>
        );
    }

    return (
        <SchemaBrowserProvider dataSource={dataSource}>
            <SchemaBrowserContent
                containerHeight={containerHeight}
                itemHeight={itemHeight}
                searchPlaceholder={searchPlaceholder}
                itemLabel={itemLabel}
                renderListItem={renderListItem as any}
                renderDetail={renderDetail}
            />
        </SchemaBrowserProvider>
    );
};

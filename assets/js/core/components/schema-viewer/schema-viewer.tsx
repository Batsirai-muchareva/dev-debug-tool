import React from 'react';
import {
    SchemaNavigationProvider,
    SchemaSearchProvider,
    useSchemaNavigation,
} from '@app/providers/schema/context';
import { SchemaList } from './schema-list';
import { SchemaDetail } from './schema-detail';
import { bemBlock } from '@app/utils/bem';

const bem = bemBlock.element('schema-viewer');

/**
 * Schema Viewer Content
 * 
 * Switches between list and detail views based on navigation state.
 */
const SchemaViewerContent: React.FC = () => {
    const { view } = useSchemaNavigation();

    return (
        <div className={bem}>
            {view === 'list' ? <SchemaList /> : <SchemaDetail />}
        </div>
    );
};

/**
 * Schema Viewer
 * 
 * Main component for browsing Elementor's style schema.
 * Features:
 * - Virtualized list for performance (thousands of schemas)
 * - Search/filter on schema keys
 * - Lazy loading of schema details
 * - Clean list → detail navigation
 * 
 * @example
 * ```tsx
 * // Use in a tab or panel
 * <SchemaViewer />
 * ```
 */
export const SchemaViewer: React.FC = () => {
    return (
        <SchemaNavigationProvider>
            <SchemaSearchProvider>
                <SchemaViewerContent />
            </SchemaSearchProvider>
        </SchemaNavigationProvider>
    );
};

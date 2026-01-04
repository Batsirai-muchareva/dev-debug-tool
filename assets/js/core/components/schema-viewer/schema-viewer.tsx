import React, { useMemo } from 'react';
import { SchemaBrowser } from '@libs/schema-browser';
import { useBounds } from '@app/context/bounds-context';

/**
 * Style Schema Viewer
 *
 * Connects the generic SchemaBrowser lib to the Elementor style schema.
 * The lib handles all the UI logic (virtualization, search, navigation),
 * while the data comes from the provider layer.
 */
export const SchemaViewer: React.FC = () => {
    const { size } = useBounds();

    // Get data source from provider layer
    const dataSource = useMemo(() => {}, []);

    // Calculate container height
    const containerHeight = Math.max(200, size.height - 180);

    return (
        <SchemaBrowser
            dataSource={dataSource as any}
            containerHeight={containerHeight}
            itemHeight={32}
            searchPlaceholder="Search schemas..."
            itemLabel="schemas"
        />
    );
};

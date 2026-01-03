import React, { useMemo, useRef } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { useSchemaNavigation } from '@app/providers/schema/context';
import { schemaAdapter } from '@app/adapters/elementor/schema';
import { useBounds } from '@app/context/bounds-context';
import { bemBlock } from '@app/utils/bem';

const bem = bemBlock.element('schema-detail');

/**
 * Schema Detail View
 * 
 * Shows the full JSON content of a selected schema.
 * Data is loaded lazily - only when the user navigates to detail view.
 */
export const SchemaDetail: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { selectedKey, goBack } = useSchemaNavigation();
    const { size } = useBounds();

    // Load schema data only when viewing detail (lazy loading)
    const schemaData = useMemo(() => {
        if (!selectedKey) return null;
        return schemaAdapter.getSchema(selectedKey);
    }, [selectedKey]);

    // Stringify only when we have data
    const jsonString = useMemo(() => {
        if (!schemaData) return '';
        return JSON.stringify(schemaData, null, 2);
    }, [schemaData]);

    if (!selectedKey) {
        return null;
    }

    const scrollableHeight = Math.max(200, size.height - 240);

    return (
        <div className={bem}>
            <div className={`${bem}__header`}>
                <button
                    className={`${bem}__back`}
                    onClick={goBack}
                    type="button"
                >
                    ← Back
                </button>
                <h3 className={`${bem}__title`} title={selectedKey}>
                    {selectedKey}
                </h3>
            </div>

            <div
                ref={scrollRef}
                className={`${bem}__content`}
                style={{ height: scrollableHeight }}
            >
                {schemaData ? (
                    <SyntaxHighlighter
                        language="json"
                        style={atomOneDark}
                        showLineNumbers
                        customStyle={{
                            flex: 1,
                            margin: 0,
                            background: 'rgb(12 22 41)',
                            height: '100%',
                            fontSize: '12px',
                        }}
                        codeTagProps={{
                            style: {
                                display: 'block',
                                fontFamily: 'monospace',
                            },
                        }}
                    >
                        {jsonString}
                    </SyntaxHighlighter>
                ) : (
                    <div className={`${bem}__empty`}>
                        Schema not found
                    </div>
                )}
            </div>
        </div>
    );
};

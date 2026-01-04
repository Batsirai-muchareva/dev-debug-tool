import React, { useMemo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { useSchemaNavigation, useSchemaDataSource } from '../context/schema-browser-context';

interface SchemaDetailProps {
    /** Height of the detail container */
    containerHeight: number;

    /** Custom renderer for detail content */
    renderContent?: (key: string, data: unknown) => React.ReactNode;
}

/**
 * Schema Detail View
 * 
 * Shows the full JSON content of a selected key.
 * Data is loaded lazily - only when the user navigates to detail view.
 */
export const SchemaDetail: React.FC<SchemaDetailProps> = ({
    containerHeight,
    renderContent,
}) => {
    const { selectedKey, goBack } = useSchemaNavigation();
    const dataSource = useSchemaDataSource();

    // Load data only when viewing detail (lazy loading)
    const data = useMemo(() => {
        if (!selectedKey) return null;
        return dataSource.getData(selectedKey);
    }, [selectedKey, dataSource]);

    // Stringify only when we have data
    const jsonString = useMemo(() => {
        if (!data) return '';
        return JSON.stringify(data, null, 2);
    }, [data]);

    if (!selectedKey) {
        return null;
    }

    const contentHeight = Math.max(100, containerHeight - 60);

    return (
        <div className="schema-browser__detail">
            <div className="schema-browser__detail-header">
                <button
                    className="schema-browser__detail-back"
                    onClick={goBack}
                    type="button"
                >
                    ← Back
                </button>
                <h3 className="schema-browser__detail-title" title={selectedKey}>
                    {selectedKey}
                </h3>
            </div>

            <div
                className="schema-browser__detail-content"
                style={{ height: contentHeight }}
            >
                {data ? (
                    renderContent ? (
                        renderContent(selectedKey, data)
                    ) : (
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
                    )
                ) : (
                    <div className="schema-browser__detail-empty">
                        Data not found
                    </div>
                )}
            </div>
        </div>
    );
};

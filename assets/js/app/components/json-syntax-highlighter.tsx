import * as React from 'react';
import { memo } from "@wordpress/element";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { Data } from "../types";

// Memoized tab content to prevent unnecessary re-renders
export const JsonSyntaxHighlighter = memo( ( { content }: { content: Data } ) => {
    const stringJson = JSON.stringify( content, null, 2 );

    return (
        <SyntaxHighlighter language="json" style={ atomOneDark } customStyle={ { flex: 1 } }>
            { stringJson }
        </SyntaxHighlighter>
    );
}, ( prevProps, nextProps) => {
    // Only re-render if content actually changed
    return prevProps.content === nextProps.content;
});

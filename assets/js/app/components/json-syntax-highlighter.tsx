import * as React from 'react';
import { memo } from "@wordpress/element";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { Data } from "../types";

export const JsonSyntaxHighlighter = memo( ( { content }: { content: Data } ) => {
    const stringJson = JSON.stringify( content, null, 2 );

    return (
        <SyntaxHighlighter codeTagProps={{ "aria-modal": "true" }} language="json" style={ atomOneDark } customStyle={ { flex: 1 } }>
            { stringJson }
        </SyntaxHighlighter>
    );
}, ( prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
});

import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

import { Data } from "../types";

export const JsonSyntaxHighlighter = ( { content }: { content: Data } ) => {
    const stringJson = JSON.stringify( content, null, 2 );

    let currentLine = 0;

    return (
        <SyntaxHighlighter
            codeTagProps={ { "aria-modal": "true", id: 'syntax-highlighter', style: {
                display: 'block',
                background: 'repeating-linear-gradient(to right, #b3222200 46px, #ffffff0a 60px)',
                fontFamily: 'monospace'
            } } }
            language="json"
            style={ atomOneDark }
            customStyle={{ flex: 1, margin: 0 }}
            wrapLines
            lineProps={ () => {
                currentLine ++;

                return { "data-line": currentLine, className: '' }
            } }
        >
            { stringJson }
        </SyntaxHighlighter>
    );
};

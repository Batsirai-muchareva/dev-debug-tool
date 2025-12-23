import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export const JsonSyntaxHighlighter = ( { content }: { content: any } ) => {
    const stringJson = JSON.stringify( content, null, 2 );

    let currentLine = 0;

    return (
        <SyntaxHighlighter
            codeTagProps={{ "aria-modal": "true", style: {
                display: 'block',
                background: 'repeating-linear-gradient(to right, #b3222200 46px, #ffffff0a 60px)',
                fontFamily: 'monospace',
                } }}
            language="json"
            style={ atomOneDark }
            customStyle={{ flex: 1, margin: 0, background: 'rgb(12 22 41)', height: '100%' }}
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

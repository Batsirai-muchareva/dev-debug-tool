import * as React from "react";

import { JsonSyntaxHighlighter } from "../json-syntax-highlighter";
import { Data } from "../../types";
import { EmptyState } from "../empty-state";

export const TabContent = ( { content }: { content: Data | string } ) => {
    const shouldShowData = typeof content !== 'string';

    if ( ! shouldShowData ) {
        return (
            <Wrapper>
                <EmptyState>
                    { content }
                </EmptyState>
            </Wrapper>
        )
    }

    return (
        <Wrapper>
            <JsonSyntaxHighlighter content={ content} />
        </Wrapper>
    );
}

function Wrapper( { children }: React.PropsWithChildren ) {
    return (
        <div className="dev-debug__tab-content">
            <div className="dev-debug__tab-panel active">
                { children }
            </div>
        </div>
    );
}

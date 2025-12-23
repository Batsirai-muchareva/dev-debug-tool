import * as React from "react";

import { EmptyState } from "../empty-state";
import { JsonSyntaxHighlighter } from "../json-syntax-highlighter";
import { ScrollableProvider } from "../../context/scrollable-context";
import { useSnapshotBind } from "../../context/snapshot-bind-context";
import { isJsonContent } from "../../utils/is-json-content";
// import JsonPathInput from "../path-input";
import { Actions } from "../actions";
import { Fill } from "@wordpress/components";
import JsonPathInput from "../json-path-input";

export const TabContent = () => {
    const { filteredContent } = useSnapshotBind();
    const content = filteredContent;

    if ( ! isJsonContent( content ) ) {
        return <EmptyState text={ content } />
    }

    return (
        <ScrollableProvider content={ content }>
            <Fill name="actions">
                <JsonPathInput />
                <Actions />
            </Fill>
            <JsonSyntaxHighlighter content={ content }/>
        </ScrollableProvider>
    );
}


// tabase saved count and by who
// insert template in debug into db or editor
// compare beautify

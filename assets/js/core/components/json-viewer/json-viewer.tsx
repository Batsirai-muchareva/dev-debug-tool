import React from "react";
import { Scrollable } from "@component/scrollable";
import { JsonSyntax } from "@component/json-viewer/json-syntax";
import { useRef } from "@wordpress/element";
import { useHighlight, useJsonChanges } from "@libs/json-diffs";
import { useScrollToLine } from "@app/hooks/use-scroll-to-line";

type Props = {
    height?: number
}
export const JsonViewer = ( {}: Props ) => {
    const containerRef = useRef<HTMLDivElement>( null );
    const { scrollToLine, highlighterChanges } = useJsonChanges();

    useScrollToLine( containerRef, scrollToLine );

    useHighlight( containerRef, highlighterChanges );

    return (
        <Scrollable ref={ containerRef } >
            <JsonSyntax />
        </Scrollable>
    )
}

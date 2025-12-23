import React, { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@component/empty-state";
import { JsonSyntaxHighlighter } from "@component/json-syntax-highlighter";
import { Scrollable } from "@component/scrollable";
import { getUpdatedLines } from "@app/utils/get-updated-lines";
import { useFilteredData } from "@app/context/filter-context";
import { PathInput } from "@component/search-input/path-input";
import { Actions } from "@component/actions";
import { useTabConfig } from "@app/hooks/use-tab-config";

export const TabPanel = () => {
    const { data } = useFilteredData();
    const [ tempJson, setTempJson ] = useState( data );
    const [ lineNumber, setLineNumber ] = useState( 0 );
    const { getMessage, shouldShowData } = useTabConfig();

    useEffect( () => {
        if ( ! data || Object.keys( data ).length === 0 ) {
            return
        }

        const updatedLines = getUpdatedLines( data, tempJson );

        if ( updatedLines.length > 0 ) {
            setLineNumber( updatedLines[0].lineNumber)
        }

        setTempJson( data )
    }, [ data ] );


    if ( ! shouldShowData?.( data ) ) {
        return <EmptyState text={ getMessage?.( data ) } />
    }

    return (
        <>
            <PathInput />
            <Actions />
            <Scrollable scrollToLine={ lineNumber }>
                <JsonSyntaxHighlighter content={ data }/>
            </Scrollable>
        </>
    )
}

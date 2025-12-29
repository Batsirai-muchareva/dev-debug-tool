import React, { useEffect, useState } from "react";
import { EmptyState } from "@component/empty-state";
import { JsonSyntaxHighlighter } from "@component/json-syntax-highlighter";
import { Scrollable } from "@component/scrollable";
import { getUpdatedLines } from "@app/utils/get-updated-lines";
import { useFilteredData } from "@app/context/filter-context";
import { PathInput } from "@component/search-input/path-input";
import { Actions } from "@component/actions";
import { useTabConfig } from "@app/hooks/use-tab-config";
import { useTabs } from "@app/context/tabs/tabs-context";
import { diffJSONWithLineNumbers } from "@libs/scrollable/json-diff-with-lines";

export const TabPanel = () => {
    const { activeSubTab } = useTabs();
    const { data } = useFilteredData();
    const [ tempJson, setTempJson ] = useState( data );
    const [ lineNumber, setLineNumber ] = useState( 0 );
    const { getMessage, shouldShowData } = useTabConfig();

    useEffect( () => {
        if ( ! data || Object.keys( data ).length === 0 ) {
            return
        }

        const updatedLines = getUpdatedLines( data, tempJson );

        console.log( diffJSONWithLineNumbers( data, tempJson ) )

        if ( updatedLines.length > 0 ) {
            setLineNumber( updatedLines[0].lineNumber);
        }

        setTempJson( data )
    }, [ data ] );


    if ( ! shouldShowData?.( data ) ) {
        return <EmptyState text={ getMessage?.( data, activeSubTab ) } />
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

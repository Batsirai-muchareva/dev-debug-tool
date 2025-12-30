import React, { useEffect, useState } from "react";
import { EmptyState } from "@component/empty-state";
import { JsonSyntaxHighlighter } from "@component/json-syntax-highlighter";
import { Scrollable } from "@component/scrollable";
import { useFilteredData } from "@app/context/filter-context";
import { PathInput } from "@component/search-input/path-input";
import { Actions } from "@component/actions";
import { useTabConfig } from "@app/hooks/use-tab-config";
import { useTabs } from "@app/context/tabs/tabs-context";
import { Changes, getJsonDiff } from "@libs/json-diffs/json-diffs";
import { Highlight } from "@component/highlight";

export const TabPanel = () => {
    const { activeSubTab } = useTabs();
    const { data: newJSON } = useFilteredData();
    const [ oldJSON, setOldJSON ] = useState( newJSON );
    const [ scrollToLIne, setScrollToLIne ] = useState<number | undefined>( 0 );
    const [ changes, setChanges ] = useState<Changes[]>([]);
    const { getMessage, shouldShowData } = useTabConfig();

    useEffect( () => {
        if ( ! newJSON || Object.keys( newJSON ).length === 0 ) {
            return
        }

        const changes = getJsonDiff( { oldJSON, newJSON } );

        if ( changes.changes.length > 0 ) {
            setScrollToLIne( changes.scrollToLine );
            setChanges( changes.changes );
        }

        setOldJSON( newJSON );
    }, [ newJSON ] );


    if ( ! shouldShowData?.( newJSON ) ) {
        return <EmptyState text={ getMessage?.( newJSON, activeSubTab ) } />
    }

    return (
        <>
            <PathInput />
            <Actions />
            <Highlight changes={ changes }>
                <Scrollable scrollToLine={ scrollToLIne }>
                <JsonSyntaxHighlighter content={ newJSON }/>
            </Scrollable>
            </Highlight>

        </>
    )
}

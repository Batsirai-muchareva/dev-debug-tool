import React from "react";
import { EmptyState } from "@component/empty-state";
import { useFilteredData } from "@app/context/filter-context";
import { PathInput } from "@component/search-input/path-input";
import { Actions } from "@component/actions";
import { useTabConfig } from "@app/hooks/use-tab-config";
import { useTabs } from "@app/context/tabs/tabs-context";
import { JsonViewer } from "@component/json-viewer/json-viewer";

export const TabPanel = () => {
    const { activeSubTab } = useTabs();
    const { data: newJSON } = useFilteredData();
    const { getMessage, shouldShowData } = useTabConfig();

    if ( ! shouldShowData?.( newJSON ) ) {
        return <EmptyState text={ getMessage?.( newJSON, activeSubTab ) } />
    }

    return (
        <>
            <PathInput />
            <Actions />
            <JsonViewer />
        </>
    )
}

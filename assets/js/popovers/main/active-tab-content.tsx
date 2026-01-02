import { useTabs } from "@app/context/tabs/tabs-context";
import { useFilteredData } from "@app/context/filter-context";
import { useTabConfig } from "@app/hooks/use-tab-config";
import { EmptyState } from "@component/empty-state";
import { PathInput } from "@component/search-input/path-input";
import { Actions } from "@component/actions";
import { JsonViewer } from "@component/json-viewer/json-viewer";
import React from "react";

export const ActiveTabContent = () => {
    const { activeSubTab } = useTabs();
    const { data, originalData } = useFilteredData();
    const { getMessage, shouldShowData, variants } = useTabConfig();

    if ( ! shouldShowData?.( originalData ) ) {
        return <EmptyState text={ getMessage?.( originalData ) } />
    }

    const activeVariant = variants.find( v => v.id === activeSubTab );
    const showVariantData = activeVariant?.shouldShowData?.( originalData );

    // handle properly empty state
    return (
        <>
            <PathInput disabled={ ! showVariantData }/>
            <Actions disabled={ ! showVariantData } />
            {
                showVariantData
                    ? <JsonViewer />
                    : <EmptyState text={ activeVariant?.getEmptyMessage?.( data ) } />
            }
        </>
    )
}

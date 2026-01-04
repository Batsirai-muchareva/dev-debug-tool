import React, { useEffect, useState } from "react";
import { useTabs } from "@app/context/tabs/tabs-context";
import { useFilteredData } from "@app/context/filter-context";
import { useTabConfig } from "@app/hooks/use-tab-config";
import { EmptyState } from "@component/empty-state";
import { JsonView } from "@component/json-viewer/json-view";
import { SchemaViewer } from "@component/schema-viewer";
import { Toolbar } from "@component/toolbar";
import { BrowseView } from "@component/json-viewer/browse-view";
import { eventBus } from "@app/events";

export const ActiveTabContent = () => {
    const [ selectedBrowsedKeys, setSelectedBrowsedKeys ] = useState<Record<string, string>>( {} );

    const { activeVariant } = useTabs();
    const { originalData } = useFilteredData();
    const { supportsBrowsing } = useTabConfig();
    const hasData = Boolean( originalData );

    const isBrowsing = supportsBrowsing && ! selectedBrowsedKeys[ activeVariant ] && hasData;
    const isEmpty = ! hasData;

    // empty view
    // browse view
    // json view

    useEffect( () => {
        if ( selectedBrowsedKeys[activeVariant] ) {
            eventBus.emit( 'browse:key:selected', { key: selectedBrowsedKeys[activeVariant] } );
        }

    }, [ selectedBrowsedKeys, originalData ] )

    if ( isBrowsing ) {
        return (
            <BrowseView
                selectedKey={ selectedBrowsedKeys[ activeVariant ] }
                onSelect={ ( key ) => {
                    setSelectedBrowsedKeys( ( prevState ) => {
                        return ( { ...prevState, [ activeVariant ]: key } );
                    } );
                }
            } />
        )
    }

    if ( isEmpty ) {
        return <EmptyState /> // no data to show
    }

    return <JsonView />




















    // // Use dedicated SchemaViewer for schema tab (virtualized for performance)
    // if ( activeTab === 'schema' ) {
    //     return <SchemaViewer />;
    // }
    //
    // if ( ! shouldShowData?.( originalData ) ) {
    //     return <EmptyState text={ getMessage?.( originalData ) } />
    // }
    //
    // const activeVariant = variants.find( v => v.id === activeSubTab );
    // const showVariantData = activeVariant?.shouldShowData?.( originalData );
    //
    // // handle properly empty state
    // return (
    //     <>
    //         {/*<When if={  }>*/}
    //
    //         {/*</When>*/}
    //         <Toolbar />
    //         {/*<Search disabled={ ! showVariantData }/>*/}
    //         {/*<Actions disabled={ ! showVariantData } />*/}
    //         {
    //             showVariantData
    //                 ? <JsonView />
    //                 : <EmptyState text={ activeVariant?.getEmptyMessage?.( data ) } />
    //         }
    //     </>
    // )
}


// const useView = () => {
//     // how do we say the view is browse view
//     // how do we say its now json view
//     // how do we say its empty
//
//     // we need to define these
//
//     return {
//         isBrowsing: provider.supportsBrowsing && selectedBrowsedKeys
//     }
// }

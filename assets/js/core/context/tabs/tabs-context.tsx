import React, { useMemo } from "react";
import { useState, PropsWithChildren } from "react";
import { createContext, useContext, useEffect } from "@wordpress/element";
import { ContextState, SubTab, Tab } from "@app/context/tabs/types";
import { createIndexResolver } from "@app/context/tabs/create-index-resolver";
import { buildTabs } from "@app/context/tabs/build-tabs";
import { DataGetEvent, SWITCH_SUB_TAB_EVENT } from "@app/events/event-lists";
import { dispatchCustomEvent } from "@app/events/dispatcher/dispatch-custom-event";
import { listenToEvent } from "@app/events/listeners/listen-to-event";

const TabsContext = createContext< ContextState | undefined >( undefined );

export const TabsProvider = ( { children }: PropsWithChildren ) => {
    const { tabs, initialState } = useMemo( () => getTabState( buildTabs() ), [] );

    const [ activeTab, setActiveTab ] = useState< Tab['id'] >( initialState.activeTabId );
    const [ activeSubTabs, setActiveSubTabs ] = useState< Record<Tab['id'], SubTab['id']> >( initialState.activeSubTab );

    useEffect( () => {
        return listenToEvent<{ id: string }>( SWITCH_SUB_TAB_EVENT, ( { detail } ) => {
            setSubTab( detail.id )
        } )
    }, [] );

    const setTab = ( tabId: Tab["id"] ) => {
        setActiveTab( tabId );
    }

    const setSubTab = ( subTabId: SubTab["id"] ) => {
        dispatchCustomEvent( DataGetEvent( activeTab, subTabId ), { id: subTabId } );

        setActiveSubTabs( prev => ( {
            ...prev,
            [ activeTab ]: subTabId,
        } ) );
    };

    const activeSubTab = activeSubTabs[ activeTab ];

    return (
        <TabsContext.Provider value={ {
            activeTab,
            activeSubTab,
            setTab,
            setSubTab,
            tabs,
            getActiveIndex: createIndexResolver( tabs, activeTab, activeSubTab )
        } }>
            {children}
        </TabsContext.Provider>
    );
};

export const useTabs = () => {
    const context = useContext( TabsContext );

    if ( ! context ) {
        throw new Error("useTabs must be used within a TabsProvider");
    }

    return context;
};

const getTabState = ( tabs: Tab[] ) => ( {
    tabs,
    initialState:{
        activeTabId: tabs[0]?.id,
        activeSubTab: Object.fromEntries( tabs.map( ( tab ) => ( [ tab.id, tab.subTabs[0]?.id ] ) ) )
// {
//             // [ tabs[0]?.id ]: tabs[0]?.subTabs[0]?.id
//         },
    },
} );

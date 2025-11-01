import * as React from "react";
import { createContext, useContext, useMemo, useState } from "@wordpress/element";
import { PropsWithChildren } from "react";
import { useSnapshot } from "./snapshot-context";
import { Data } from "../types";

type TabHeader = {
    key: string;
    label: string;
}

type State = {
    activeTab: string;
    setActiveTab: ( key: string ) => void;
    tabHeaders: TabHeader[];
    getTabContent: () => Data | string;
};

const TabsContext = createContext<State | undefined>( undefined );

export const TabsProvider = ( { children }: PropsWithChildren ) => {
    const [ activeKey, setActiveKey ] = useState( 'editor' ); // should set dynamically
    const { snapshot } = useSnapshot();

    const setActiveTab = ( key: string ) => {
        setActiveKey( key )
    }

    const tabHeaders = useMemo( () =>
            Object.entries( snapshot ).map( ( [ key, value ] ) => ( {
                key,
                label: value.label,
            } ) ),
        [ snapshot ]
    );

    const getTabContent = () => {
        return snapshot[ activeKey ].content;
    }

    return (
        <TabsContext.Provider value={ { activeTab: activeKey, setActiveTab, tabHeaders, getTabContent } }>
            {children}
        </TabsContext.Provider>
    );
};

export const useTabs = () => {
    const context = useContext( TabsContext )

    if ( ! context) {
        throw new Error("useTabs must be used within a TabsProvider");
    }

    return context;
}

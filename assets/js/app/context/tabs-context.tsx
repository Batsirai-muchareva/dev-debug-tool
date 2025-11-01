import * as React from "react";
import { useEffect, useCallback, useContext, useMemo, useState } from "@wordpress/element";
import { createContext } from "@wordpress/element";
import { Data } from "../types";
import { useSnapshot } from "./snapshot-context";

import { PropsWithChildren } from "react";

interface TabsContextValue {
    activeKey: string;
    setActiveKey: ( key: string ) => void;
    getHeaders: () => any[];
    getActiveContent: () => Data | string | undefined;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const TabsProvider = ({ children }: PropsWithChildren) => {
    const { snapshot } = useSnapshot();
    const [activeKey, setActiveKey] = useState<string>('');

   useEffect(() => {
        const snapshotKeys = Object.keys( snapshot );

        if ( ! activeKey && snapshotKeys.length > 0 ) {
            setActiveKey( snapshotKeys[0] );
        }
    }, [ snapshot, activeKey ]);

    const getActiveContent = useCallback(() => {
        if ( ! activeKey || ! snapshot[ activeKey ] ) {
            return undefined;
        }

        return snapshot[activeKey].content;

    }, [ activeKey, snapshot ] );

    const getHeaders = useCallback( () => {
        return Object.entries( snapshot ).map( ( [ key, value ] ) => ( {
            key,
            label: value.label,
        } ) )
    }, [ activeKey ] );

    return (
        <TabsContext.Provider value={ { getHeaders, getActiveContent, activeKey, setActiveKey } }>
            {children}
        </TabsContext.Provider>
    );
};

export const useTabs = () => {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error("useTabs must be used within a TabsProvider");
    }

    return context;
};










// useEffect(() => {
//     setContextAccessor({ getActiveContent });
// }, [getActiveContent]);
//
// const value = useMemo(
//     () => ({ activeKey, setActiveKey, getActiveContent }),
//     [activeKey, getActiveContent]
// );



// import * as React from "react";
// import { createContext, useContext, useMemo, useState } from "@wordpress/element";
// import { PropsWithChildren } from "react";
// import { useSnapshot } from "./snapshot-context";
// import { Data } from "../types";
//
// type TabHeader = {
//     key: string;
//     label: string;
// }
//
// type State = {
//     activeTab: string;
//     setActiveTab: ( key: string ) => void;
//     tabHeaders: TabHeader[];
//     getTabContent: () => Data | string;
// };
//
// const TabsContext = createContext<State | undefined>( undefined );
//
// export const TabsProvider = ( { children }: PropsWithChildren ) => {
//     const [ activeKey, setActiveKey ] = useState( 'editor' ); // should set dynamically
//     const { snapshot } = useSnapshot();
//
//     const setActiveTab = ( key: string ) => {
//         setActiveKey( key )
//     }
//
//     const tabHeaders = useMemo( () =>
//             Object.entries( snapshot ).map( ( [ key, value ] ) => ( {
//                 key,
//                 label: value.label,
//             } ) ),
//         [ snapshot ]
//     );
//
//     const getTabContent = () => {
//         return snapshot[ activeKey ].content;
//     }
//
//     return (
//         <TabsContext.Provider value={ { activeTab: activeKey, setActiveTab, tabHeaders, getTabContent } }>
//             {children}
//         </TabsContext.Provider>
//     );
// };
//
// export const useTabs = () => {
//     const context = useContext( TabsContext )
//
//     if ( ! context) {
//         throw new Error("useTabs must be used within a TabsProvider");
//     }
//
//     return context;
// }


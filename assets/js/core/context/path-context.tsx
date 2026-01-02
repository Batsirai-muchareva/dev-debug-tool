import React from "react";
import { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "@wordpress/element";
import { useTabs } from "@app/context/tabs/tabs-context";

type State = {
    path: string;
    setPath: ( newPath: string ) => void;
};

const PathContext = createContext<State | undefined >( undefined );

export const PathProvider = ( { children }: PropsWithChildren ) => {
    const [ paths, setPaths ] = useState<Record<string, Record<string, string>>>({});
    const { activeTab, activeSubTab } = useTabs();

    const setPath = ( newPath: string ) => {
        setPaths( prev  => ( {
            ...prev,
            [ activeTab ]: {
                ...prev[activeTab],
                [activeSubTab]: newPath
            }
        } ) );
    };

    return (
        <PathContext.Provider
            value={ {
                path: paths[activeTab]?.[activeSubTab] ?? "",
                setPath,
            } }
        >
            { children }
        </PathContext.Provider>
    );
};

export const usePath = () => {

    const context = useContext( PathContext );

    if ( ! context ) {
        throw new Error("usePath must be used within a PathProvider");
    }

    return context;
};

import { useState } from "react";
import { useTabs } from "@app/context/tabs/tabs-context";

export const usePath = () => {
    const { activeTab, activeSubTab } = useTabs();
    const [ paths, setPaths ] = useState<Record<string, Record<string, string>>>({});

    const setPath = ( newPath: string ) => {
        setPaths( prev  => ( {
            ...prev,
            [ activeTab ]: {
                ...prev[activeTab],
                [activeSubTab]: newPath
            }
        } ) );
    };

    return {
        path: paths[activeTab]?.[activeSubTab] ?? "",
        setPath,
    }
}

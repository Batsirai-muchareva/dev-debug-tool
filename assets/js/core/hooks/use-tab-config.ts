import { useTabs } from "@app/context/tabs/tabs-context";
import { useMemo } from "react";
import { getProviderConfig } from "@app/manager/register-data-providers";

export const useTabConfig = () => {
    const { activeTab } = useTabs();

    const config = useMemo( () =>
            getProviderConfig().find( ( { id }) => id === activeTab ),
        [ activeTab ]
    );

    if ( ! config ) {
        throw new Error( `Config not found for key ${ activeTab }` )
    }

    return config
}

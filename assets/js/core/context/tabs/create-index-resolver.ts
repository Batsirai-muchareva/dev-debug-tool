import { SubTab, Tab } from "@app/context/tabs/types";
import { useKey } from "@app/context/key-context";

export const createIndexResolver =
    (
        tabs: Tab[],
        activeTabId?: Tab["id"],
        activeSubTabId?: SubTab["id"]
    ) =>
        (): number => {
            const target = useKey();

            if ( target === "tab" ) {
                return tabs.findIndex( tab => tab.id === activeTabId );
            }

            if ( ! activeTabId ) {
                return -1;
            }

            const tab = tabs.find( tab => tab.id === activeTabId );

            return tab?.subTabs.findIndex( st => st.id === activeSubTabId ) ?? -1;
        };

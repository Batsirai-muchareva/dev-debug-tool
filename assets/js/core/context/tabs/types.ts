import { DataProvider } from "@app/types";

export type TabScope = "tab" | "sub-tab";

export type SubTab = {
    id: string;
    label: string;
};

export type Tab = {
    id: DataProvider['id'];
    title: DataProvider['title'];
    subTabs: SubTab[];
};

export type ContextState = {
    activeTab: Tab['id'];
    activeSubTab: SubTab['id'];
    tabs: Tab[];
    setTab: ( tabId: Tab['id'] ) => void;
    setSubTab: ( subTabId: SubTab['id'] ) => void;
    getActiveIndex: ( target: TabScope ) => number;
}
// Record<Tab['id'], SubTab['id']>

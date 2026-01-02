import { Provider } from "@app/types";

export type TabScope = "tab" | "sub-tab";

export type SubTab = {
    id: string;
    label: string;
};

export type Tab = {
    id: Provider['id'];
    title: Provider['title'];
    subTabs: SubTab[];
};

export type ContextState = {
    activeTab: Tab['id'];
    activeSubTab: SubTab['id'];
    tabs: Tab[];
    setTab: ( tabId: Tab['id'] ) => void;
    setSubTab: ( subTabId: SubTab['id'] ) => void;
    getActiveIndex: () => number;
}

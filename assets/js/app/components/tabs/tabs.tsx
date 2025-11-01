import * as React from 'react';

import { TabHeader } from "./tab-header";
import { TabContent } from "./tab-content";
import { Actions } from "../actions";
import { useTabs } from "../../context/tabs-context";

export const Tabs = () => {
    const { activeKey, setActiveKey, getHeaders, getActiveContent } = useTabs();

    const content = getActiveContent();
    const headers = getHeaders();

    return (
        <div className="dev-debug__tabs-container">
            <div className="dev-debug__tab-header">
                { headers.map( ( { key, label } ) => (
                    <TabHeader
                        key={ key }
                        label={ label }
                        isActive={ activeKey === key }
                        onClick={ () => setActiveKey( key ) }
                    />
                ) ) }
            </div>
            <Actions />
            {content && <TabContent content={ content }/>}
        </div>
    );
}

import * as React from 'react';
import { useState, useMemo } from "@wordpress/element";

import { TabHeader } from "./tab-header";
import { TabContent } from "./tab-content";
import { Actions } from "../actions";
import { useSnapshot } from "../../context/snapshot-context";

export const Tabs = () => {
    const { snapshot } = useSnapshot();
    const [ activeKey, setActiveKey ] = useState( 'editor' ); // should set dynamically

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
        <div className="dev-debug__tabs-container">
            <div className="dev-debug__tab-header">
                { tabHeaders.map( ( { key, label } ) => (
                    <TabHeader
                        key={ key }
                        label={ label }
                        isActive={ activeKey === key }
                        onClick={ () => setActiveKey( key ) }
                    />
                ) ) }
            </div>
            <Actions />
            <TabContent content={ getTabContent() }/>
        </div>
    );
}

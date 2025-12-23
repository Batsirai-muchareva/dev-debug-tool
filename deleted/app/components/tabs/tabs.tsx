import * as React from 'react';

import { TabHeader } from "./tab-header";
import { TabContent } from "./tab-content";
import { useSnapshot } from "../../context/snapshot-context";
import { useCallback, useEffect, useState } from "@wordpress/element";
import { SnapshotBindProvider } from "../../context/snapshot-bind-context";
import { POSITION_TRACKER_SLOT_ID } from "../floating-button";
import { Slot } from "@wordpress/components";

export const Tabs = () => {
    const { snapshot } = useSnapshot();
    const [ activeTab, setActiveTab ] = useState<string>( () => {
        const snapshotKeys = Object.keys( snapshot );

        if ( snapshotKeys.length > 0 ) {
            return snapshotKeys[0];
        }

        return '';
    } );

    const getTabHeaders = useCallback( () => {
        return Object.entries( snapshot ).map( ( [ key, value ] ) => ( {
            key,
            label: value.label,
        } ) )
    }, [] );

    return (
        <SnapshotBindProvider bind={ activeTab }>
            <div className="dev-debug__tabs-container">
                <div className="dev-debug__tab-header">
                    { getTabHeaders().map( ( { key, label } ) => (
                        <TabHeader
                            key={ key }
                            label={ label }
                            isActive={ activeTab === key }
                            onClick={ () => setActiveTab( key ) }/>
                    ) ) }
                </div>
                <Slot name="actions" />
                <TabContent />
            </div>
        </SnapshotBindProvider>
    );
}
// get content json
//function isJsonContent( content: Data | string | undefined ): content is Data {
//     return content !== undefined && content !== null && typeof content !== 'string';
// }
// json path to be stored in local storage
// if not available reach out to empty message

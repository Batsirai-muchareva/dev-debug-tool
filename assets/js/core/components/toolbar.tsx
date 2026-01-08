import React from "react";
import { useResolvedData } from "@app/context/data/resolved-data-context";
import { useBrowse } from "@app/context/browse-context";
import { Flex } from "@component/ui/flex";
import { Search2 } from "@component/search";
import { bemBlock } from "@app/utils/bem";
import { ActionsComponent } from "@app/actions/actions-component";

export const Toolbar = () => {
    const { hasNoData } = useResolvedData();

    if ( hasNoData ) {
        return null;
    }

    // condition to hide or show
    return (
        <div className={ bemBlock.element( 'toolbar' ) }>
            {/*<Search />*/}
            <Search2 />
            <Flex>
                <GoBack />
                <ActionsComponent />
            {/*  ViewJsonTree component  */}
            </Flex>
        </div>
    )
}

const GoBack = () => {
    const { selectedKey, back } = useBrowse();

    if ( ! selectedKey ) {
        return null
    }

    return (
        <div style={{ display: "flex", justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
             <button
                 className="schema-browser__detail-back"
                 onClick={ back }
                 type="button"
             >
            ← Back
        </button>
             <h3 className="schema-browser__detail-title" title={selectedKey}>
                    {selectedKey}
                </h3>
        </div>

    )
}

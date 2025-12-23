import * as React from "react";
import { MAIN_POPOVER_KEY, usePopover } from "@app/context/popover-context";
import { FilterProvider } from "@app/context/filter-context";
import { TabsProvider } from "@app/context/tabs/tabs-context";
import { MainPopover } from "./popovers/MainPopover";
import { SuggestionsPopover } from "./popovers/SuggestionsPopover";
import { useRef } from "@wordpress/element";

export const Panel = () => {
    const { isOpen: mainPopoverState } = usePopover( MAIN_POPOVER_KEY );
    const mainPopoverRef = useRef( null );

    if ( ! mainPopoverState ) {
        return null;
    }

    return (
        <TabsProvider>
            <FilterProvider>
                <MainPopover ref={ mainPopoverRef } />
                <SuggestionsPopover anchorRef={ mainPopoverRef } />
            </FilterProvider>
        </TabsProvider>
    )
}

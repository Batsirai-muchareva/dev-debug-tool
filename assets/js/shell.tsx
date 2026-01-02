import * as React from "react";
import { MAIN_POPOVER_KEY, usePopover } from "@app/context/popover-context";
import { FilterProvider } from "@app/context/filter-context";
import { TabsProvider } from "@app/context/tabs/tabs-context";
import { SuggestionsPopover } from "./popovers/suggestions-popover";
import { useRef } from "@wordpress/element";
import { MainPopover } from "./popovers/main/main-popover";
import { PathProvider } from "@app/context/path-context";

export const Shell = () => {
    const { isOpen: mainPopoverState } = usePopover( MAIN_POPOVER_KEY );
    const mainPopoverRef = useRef( null );

    if ( ! mainPopoverState ) {
        return null;
    }

    return (
        <TabsProvider>
            <PathProvider>
                <FilterProvider>
                    <MainPopover ref={ mainPopoverRef } />
                    <SuggestionsPopover anchorRef={ mainPopoverRef } />
                </FilterProvider>
            </PathProvider>
        </TabsProvider>
    )
}

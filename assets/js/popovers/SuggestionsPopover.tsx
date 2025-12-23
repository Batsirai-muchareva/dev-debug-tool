import React from "react";
import { Popover } from "@component/popover/popover";
import { PopoverHeader } from "@component/popover/popover-header";
import { Padding } from "@component/padding";
import { Flex } from "@component/ui/flex";
import { Label } from "@component/ui/label";
import { Button } from "@component/ui/button";
import { PopoverContent } from "@component/popover/popover-content";
import { Suggestions } from "@component/suggestions";
import { SEARCH_POPOVER_KEY, usePopover } from "@app/context/popover-context";

export const SuggestionsPopover = ( { anchorRef }: { anchorRef: React.RefObject<HTMLDivElement> } ) => {
    const { close: closeSearchPopover } = usePopover( SEARCH_POPOVER_KEY );

    return (
        <Popover gutter={ { top: 150, left: -20 } } anchor={ anchorRef.current } id={ SEARCH_POPOVER_KEY }>
            <PopoverHeader>
                <Padding>
                    <Flex>
                        <Label text="JSON Paths"/>
                        <Button onClick={ closeSearchPopover }>
                            <i className="eicon-close"></i>
                        </Button>
                    </Flex>
                </Padding>
            </PopoverHeader>
            <PopoverContent>
                <Suggestions />
            </PopoverContent>
        </Popover>
    )
}

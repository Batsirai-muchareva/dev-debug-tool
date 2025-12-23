import React, { PropsWithChildren } from "react";

import { bemBlock } from "@app/utils/bem";
import { Box } from "@component/ui/box";
import { Padding } from "@component/padding";
//  style={{padding: '12px 12px 3px 12px'}}
export const PopoverHeader = ( { children }: PropsWithChildren ) => {
    return (
        <Box className={ bemBlock.element( 'popover__header' ) }>
            { children }
            <Box className={ bemBlock.element( 'popover__divider' ) }></Box>
        </Box>
    )
}

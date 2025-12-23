import React from "react";
import { Box } from "@component/ui/box";
import { bemBlock } from "@app/utils/bem";

export const SubTab = ( { label, active }: { label: string; active?: boolean } ) => {
    return (
        <Box className={ bemBlock.condElemMod( 'sub-tab', 'active', active ?? false ) }>
            { label }
        </Box>
    )
}

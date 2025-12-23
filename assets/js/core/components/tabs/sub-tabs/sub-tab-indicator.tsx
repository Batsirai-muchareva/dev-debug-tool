import { Box } from "@component/ui/box";
import React from "react";
import { bemBlock } from "@app/utils/bem";

export const SubTabIndicator = () => {
    return (
        <Box className={ bemBlock.element( 'sub-tabs-indicator' ) } />
    )
}

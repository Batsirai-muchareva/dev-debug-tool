import React, { useRef } from "react";
import { PropsWithChildren } from "react";
import { Box } from "@component/ui/box";
import { bemBlock } from "@app/utils/bem";
import { Indicator } from "@component/tabs/indicator";

export const SubTabs = ( { children }: PropsWithChildren ) => {
    const ref = useRef( null );

    return (
        <Box ref={ ref } className={ bemBlock.element( 'sub-tabs' ) }>
            <Indicator
                ref={ ref }
                index={ 0 }
                tabCount={ 3 }
                className={ bemBlock.element( 'sub-tabs-indicator' ) } />
            { children }
        </Box>
    )
}

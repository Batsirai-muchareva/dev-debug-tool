import { Box } from "@component/ui/box";
import React, { PropsWithChildren, Children, useMemo, useRef } from "react";
import { Indicator } from "@component/tabs/indicator";
import { useTabs } from "@app/context/tabs/tabs-context";
import { bemBlock } from "@app/utils/bem";
import { TabProps } from "@component/tabs/tab";
import { TabScope } from "@app/context/tabs/types";

type Props = PropsWithChildren & {
    className: string;
    indicatorClassName: string;
    variant: TabScope;
    extraChildren?: React.ReactNode;
};

export const Tabs = ( { children, className, indicatorClassName, variant, extraChildren }: Props ) => {
    const { getActiveIndex } = useTabs();
    const ref = useRef( null );
    const activeIndex = getActiveIndex( variant );

    const enhancedChildren = React.Children.toArray( children )
        .filter( ( child ): child is React.ReactElement<TabProps> =>
            React.isValidElement( child )
        )
        .map( ( child, index ) =>
            React.cloneElement( child, { variant, active: index === activeIndex } )
        );


    const tabCount = useMemo( () => Children.count( children ), [] )

    return (
        <>
            <Box ref={ ref } className={ bemBlock.element( className ) }>
                <Indicator
                    className={ bemBlock.element( indicatorClassName ) }
                    ref={ ref }
                    index={ activeIndex }
                    tabCount={ tabCount }
                />
                { enhancedChildren }
            </Box>

            { extraChildren }
        </>

    )
}

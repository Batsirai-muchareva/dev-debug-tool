import { Box } from "@component/ui/box";
import React, { PropsWithChildren, Children, useMemo, useRef } from "react";
import { Indicator } from "@component/tabs/indicator";
import { bemBlock } from "@app/utils/bem";
import { TabScope } from "@app/context/tabs/types";
import { KeyProvider } from "@app/context/key-context";

type Props = PropsWithChildren & {
    variant: TabScope;
    extraChildren?: React.ReactNode;
};

export const Tabs = ( { children, variant }: Props ) => {
    const ref = useRef( null );
    const classPrefix = variant + 's';

    const tabCount = useMemo( () => Children.count( children ), [] )

    return (
        <KeyProvider value={ variant }>
            <Box ref={ ref } className={ bemBlock.element( classPrefix ) }>
                <Indicator
                    className={ bemBlock.element( classPrefix + '-indicator' ) }
                    ref={ ref }
                    tabCount={ tabCount }
                />
                { children }
            </Box>
        </KeyProvider>
    )
}

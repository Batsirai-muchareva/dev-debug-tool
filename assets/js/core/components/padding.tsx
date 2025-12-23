import { bemBlock } from "@app/utils/bem";
import React, { PropsWithChildren } from "react";

export const Padding = ( { children }: PropsWithChildren ) => {
    return <div className={ bemBlock.element( 'padding' )}>{ children }</div>
}

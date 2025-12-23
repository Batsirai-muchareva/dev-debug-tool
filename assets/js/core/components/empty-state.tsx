import React from "react"
import { bemBlock } from "@app/utils/bem";

export const EmptyState = ( { text }: { text?: string } ) => {
    return <div className={ bemBlock.element( 'empty-state' )}>{ text ?? 'Refreshing...' }</div>
}

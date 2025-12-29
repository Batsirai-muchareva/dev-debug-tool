import React, { PropsWithChildren } from "react"
import { bemBlock } from "@app/utils/bem";
import { useDraggable } from "@libs/draggable/hooks/use-draggable";

export const Draggable = ( { children }: PropsWithChildren ) => {
    const { startDrag } = useDraggable();

    return <div onMouseDown={ startDrag } className={ bemBlock.element( 'draggable' ) }>{ children }</div>
}

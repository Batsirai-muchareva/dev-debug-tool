import React from "react";
import { PropsWithChildren } from "react";
import { bemBlock } from "@app/utils/bem";
import { useEffect, useRef } from "@wordpress/element";
import { useBounds } from "@app/context/bounds-context";

type Props = PropsWithChildren & {
    scrollToLine?: number;
}
export const Scrollable = ( { children, scrollToLine }: Props ) => {
    const ref = useRef< HTMLDivElement >( null );
    const { size } = useBounds();

    useEffect( () => {
        if ( ! scrollToLine ) {
            return;
        }

        requestAnimationFrame( () => {
            const container = ref.current as HTMLDivElement;
            const targetEl = container?.querySelector( `[data-line="${scrollToLine}"]` ) as HTMLElement;

            requestAnimationFrame( () => {
                container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
            } );

            if ( targetEl ) {
                targetEl.scrollIntoView( {
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                } );
            }
        } );
    }, [ scrollToLine ] );

    // it has to be a calculated popover size
    return (
        <div ref={ ref } style={ { height: size.height - 180 } } className={ bemBlock.element( 'scrollable' ) }>
            { children }
        </div>
    );
}

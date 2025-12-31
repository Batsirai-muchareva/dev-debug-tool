import React, { forwardRef } from "react";
import { PropsWithChildren } from "react";
import { bemBlock } from "@app/utils/bem";
import { useEffect, useRef } from "@wordpress/element";
import { useBounds } from "@app/context/bounds-context";

type Props = PropsWithChildren & {
    scrollToLine?: number;
}
export const Scrollable = forwardRef<HTMLDivElement, Props>( ( { children, scrollToLine }, ref ) => {
    // const ref = useRef< HTMLDivElement >( null );
    const { size } = useBounds();
    //
    // useEffect( () => {
    //     if ( ! scrollToLine ) {
    //         return;
    //     }
    //
    //     requestAnimationFrame( () => {
    //         const container = ref.current as HTMLDivElement;
    //
    //         if ( ! scrollToLine ) {
    //             return;
    //         }
    //
    //         const targetEl = container?.querySelector(
    //             `[data-line="${scrollToLine}"]`
    //         ) as HTMLElement | null;
    //
    //         if ( ! targetEl ) {
    //             return;
    //         }
    //
    //         // Horizontal centering (optional, safe for wide JSON)
    //         requestAnimationFrame( () => {
    //             container.scrollLeft =
    //                 ( container.scrollWidth - container.clientWidth ) / 2;
    //         } );
    //
    //
    //         // requestAnimationFrame( () => {
    //         //     container.scrollLeft =
    //         //         ( container.scrollWidth - container.clientWidth ) / 2;
    //         // } );
    //
    //         console.log( 'scroll' );
    //
    //         if ( targetEl ) {
    //             targetEl.scrollIntoView( {
    //                 behavior: 'smooth',
    //                 block: 'center',
    //                 inline: 'center'
    //             } );
    //         }
    //
    //         // Optional highlight (purely visual)
    //         // targetEl.classList.add( "is-highlighted" );
    //         // setTimeout( () => {
    //         //     targetEl.classList.remove( "is-highlighted" );
    //         // }, 1200 );
    //
    //     } );
    // }, [ scrollToLine ] );

    // it has to be a calculated popover size
    return (
        <div
            ref={ ref }
            style={ { height: size.height - 180 } }
            className={ bemBlock.element( 'scrollable' ) }
        >
            { children }
        </div>
    );
} )

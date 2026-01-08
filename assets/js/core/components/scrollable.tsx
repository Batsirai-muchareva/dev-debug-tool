import React, { forwardRef } from "react";
import { PropsWithChildren } from "react";
import { bemBlock } from "@app/utils/bem";
import { useEffect } from "@wordpress/element";
import { subtract, useBounds } from "@app/context/bounds-context";
import { lineMap } from "@libs/line-map/line-map";
import { usePath } from "@app/context/path-context";
import { useTabs } from "@app/context/tabs/tabs-context";

type Props = PropsWithChildren & {
    scrollToLine?: number;
}

export const Scrollable = forwardRef<HTMLDivElement, Props>( ( { children, scrollToLine }, ref ) => {
    const { size } = useBounds();
    const { setPath } = usePath();
    const { activeProvider } = useTabs();

    useEffect( () => {
        if ( ! ref || ! ( 'current' in ref ) || ! ref.current ) {
            return;
        }

        const handleClick = ( event: MouseEvent ) => {
            // special handle style schema style-schema:clicked
            // if ( activeTab === 'schema' && ! event.ctrlKey ) {
            //     const line = getClickedLine( event.target as HTMLElement ) as number;
            //
            //     eventBus.emit( 'style-schema:clicked', {
            //         line
            //     } );
            // }

            if ( ! event.metaKey && ! event.ctrlKey ) {
                return;
            }

            const clickedLineNumber = getClickedLine( event.target as HTMLElement ) as number;

            const pathAtLine = lineMap.pathAtLine( clickedLineNumber );

            if ( pathAtLine ) {
                setPath( pathAtLine );
            }
        }

        ref.current.addEventListener('dblclick', handleClick );

        return () => {
            ref.current?.removeEventListener('click', handleClick);
        };
    }, [] );

    const getClickedLine = ( target: HTMLSpanElement ) => {
        if ( ! ( target instanceof HTMLSpanElement ) ) {
            return;
        }

        let lineSpan = target.dataset.line ? target : target.closest( '[data-line]' ) as HTMLElement;

        if ( ! lineSpan ) {
            return;
        }

        return parseInt( lineSpan.dataset.line as string );
    }

    // it has to be a calculated popover size
    // 26
    const heightSubtract = subtract - ( activeProvider === 'schema' ? 26 : 0 );

    return (
        <div
            ref={ ref }
            style={ { height: size.height - heightSubtract } }
            className={ bemBlock.element( 'scrollable' ) }
        >
            { children }
        </div>
    );
} )

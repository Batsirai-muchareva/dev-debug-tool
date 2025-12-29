import React, { useEffect } from "react";
import { PropsWithChildren } from "react";
import { bemBlock } from "@app/utils/bem";
import { useRef } from "@wordpress/element";

export const Highlight = ( { children, highlightRange }: PropsWithChildren & { highlightRange: number[] }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeout: any;

        setTimeout( () => {
            const container = containerRef.current;
            if ( !container || !highlightRange || highlightRange.length === 0 ) return;

            // Remove previous highlights
            container.querySelectorAll( ".is-highlighted" ).forEach( el => {
                el.classList.remove( "is-highlighted" );
            } );

            // Apply highlights
            const highlightedElements: HTMLElement[] = [];
            highlightRange.forEach( lineNumber => {
                const lineEl = container.querySelector( `[data-line="${ lineNumber }"]` ) as HTMLElement;
                if ( lineEl ) {
                    lineEl.classList.add( "is-highlighted" );
                    highlightedElements.push( lineEl );
                }
            } );

            // Remove highlights after duration
             timeout = setTimeout( () => {
                highlightedElements.forEach( el => el.classList.remove( "is-highlighted" ) );
            }, 2000 );
        }, 1000 )

        return () => clearTimeout(timeout);
    //     const container = containerRef.current;
    //     if (!container || !highlightRange ) return; // || highlightRange.length !== 2
    // // || highlightRange.length !== 2
    //     const [startLine, endLine] = highlightRange;
    //
    //     // Remove previous highlights
    //     container.querySelectorAll(".is-highlighted").forEach(el => {
    //         el.classList.remove("is-highlighted");
    //     });
    //
    //     // Apply highlight to target lines
    //     const highlightedElements: HTMLElement[] = [];
    //     for (let i = startLine; i <= endLine; i++) {
    //         const lineEl = container.querySelector(`[data-line="${i}"]`) as HTMLElement;
    //         if (lineEl) {
    //             lineEl.classList.add("is-highlighted");
    //             highlightedElements.push(lineEl);
    //         }
    //     }
    //
    //     // Remove highlights after specified duration
    //     const timeout = setTimeout(() => {
    //         highlightedElements.forEach(el => el.classList.remove("highlighted"));
    //     }, 3000);
    //
    //     return () => clearTimeout(timeout);
    }, [highlightRange, children ]);

    return (
        <div ref={containerRef} className={ bemBlock.element( 'highlight' ) }>
            { children }
        </div>
    )
}

import React, { useEffect } from "react";
import { PropsWithChildren } from "react";
import { bemBlock } from "@app/utils/bem";
import { useRef } from "@wordpress/element";

type Change = {
    startLine?: number;
    endLine?: number;
    // ... other properties
};

export const Highlight = ( { children, changes }: PropsWithChildren & { changes: Change[] }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if ( !container || !changes || changes.length === 0 ) return;

        // Remove previous highlights
        container.querySelectorAll( ".is-highlighted" ).forEach( el => {
            el.classList.remove( "is-highlighted" );
        } );

        // Apply highlights for all changes
        const highlightedElements: HTMLElement[] = [];

        changes.forEach( change => {
            if ( change.startLine !== undefined ) {
                const start = change.startLine;
                const end = change.endLine ?? change.startLine;

                // Highlight all lines in the range
                for ( let lineNumber = start; lineNumber <= end; lineNumber++ ) {
                    const lineEl = container.querySelector( `[data-line="${ lineNumber }"]` ) as HTMLElement;
                    if ( lineEl && !lineEl.classList.contains( "is-highlighted" ) ) {
                        lineEl.classList.add( "is-highlighted" );
                        highlightedElements.push( lineEl );
                    }
                }
            }
        } );

        // Remove highlights after duration
        const timeout = setTimeout( () => {
            highlightedElements.forEach( el => el.classList.remove( "is-highlighted" ) );
        }, 2000 );

        return () => clearTimeout(timeout);

    }, [changes, children ]);

    return (
        <div ref={containerRef} className={ bemBlock.element( 'highlight' ) }>
            { children }
        </div>
    )
}

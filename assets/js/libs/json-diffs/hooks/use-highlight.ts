import { useCallback, useEffect } from "react";
import { RefObject, useRef } from "@wordpress/element";
import { findLineElement } from "@libs/json-diffs/utils/find-line-element";

const HIGHLIGHT_CLASSNAME = 'highlighted';
const HIGHLIGHT_TIMEOUT = 1000;

export const useHighlight = (
    containerRef: RefObject<HTMLElement>,
    lineNumbers: number[],
) => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHighlight = useCallback(() => {
        const container = containerRef.current;
        if ( ! container ) {
            return;
        }

        container
            .querySelectorAll(`.${ HIGHLIGHT_CLASSNAME }`)
            .forEach( el => el.classList.remove( HIGHLIGHT_CLASSNAME ) );
    }, [ containerRef ]);

    const highlight = useCallback( ( lines: number[]) => {
        const container = containerRef.current;

        if ( ! container || lines.length === 0 ) {
            return;
        }

        // ✅ clear previous timeout + highlights
        if ( timeoutRef.current !== null ) {
            clearTimeout( timeoutRef.current );
            timeoutRef.current = null;
        }

        clearHighlight();

        const elements = findLineElements( container, lines );

        const addHighlight = () => {
            elements.forEach( ( el ) =>
                el.classList.add( HIGHLIGHT_CLASSNAME )
            );

            timeoutRef.current = setTimeout( () => {
                elements.forEach( ( el ) => el.classList.remove( HIGHLIGHT_CLASSNAME ));
                timeoutRef.current = null;

            }, HIGHLIGHT_TIMEOUT );
        };

        requestAnimationFrame( addHighlight );
    }, [ containerRef , clearHighlight] );


    useEffect( () => {
        if ( lineNumbers.length > 0 ) {
            highlight( lineNumbers );
        }

        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
            clearHighlight();
        };
    }, [ lineNumbers, highlight, clearHighlight ]);
}

const findLineElements = (
    container: HTMLElement,
    lineNumbers: number[]
): HTMLElement[] => {
    return lineNumbers
        .map( ( line ) => findLineElement( container, line ) )
        .filter( ( el ): el is HTMLElement => el !== null );
}

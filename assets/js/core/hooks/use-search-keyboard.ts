import React, { ChangeEvent, useEffect } from "react";
import { usePath } from "@app/context/path-context";
import { useState } from "@wordpress/element";
import { useSuggestions } from "@app/hooks/use-suggestions";
import { SEARCH_POPOVER_KEY, usePopover } from "@app/context/popover-context";
import { useEventBus } from "@app/events";

export const useSearchKeyboard = ( ghostText: string, setGhostText: any, inputRef: HTMLInputElement | null ) => {
    const { path, setPath } = usePath();
    const { paths } = useSuggestions()
    const [ lastBackspaceTime, setLastBackspaceTime ] = useState<number>(0);
    const { open: openSearchPopover, isOpen, close: closeSearchPopover } = usePopover( SEARCH_POPOVER_KEY );

    useEventBus( 'suggestion:select', () => moveCaretToEnd() )

    useEffect( () => {
            if ( paths.includes( path ) ) {
                setGhostText( '' );
            } else if ( path === '' ) {
                setGhostText( '' );
            } else {
                setGhostText( paths[0] ?? '' );
            }
        }, [ path ] );

    const moveCaretToEnd = () => {
        if ( ! inputRef ) {
            return;
        }

        const input = inputRef;
        const length = input.value.length;

        // Set selection to end
        requestAnimationFrame( () => {
            input.setSelectionRange(length, length);
            // Scroll to show the end of the text
            input.scrollLeft = input.scrollWidth + 10;
        } );
    };

    const handleChange = ( event: ChangeEvent<HTMLInputElement> ) => {
        setPath( event.target.value );

        if ( ! isOpen ) {
            openSearchPopover();
        }
    }

    const handleFocus = () => {
        moveCaretToEnd();
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const isEnter = event.key === "Enter";
        const isTab = event.key === "Tab";

        const shouldAccept =
            ( isEnter || isTab ) &&
            ghostText &&
            ghostText !== path;

        if ( shouldAccept ) {
            event.preventDefault(); // Prevent form submit / tab navigation
            setPath( ghostText );


            // simulate a suggestion "select" so behavior stays consistent
            requestAnimationFrame( () => {
                moveCaretToEnd();

                if ( isEnter ) {
                    closeSearchPopover();
                }
            } );
        }

        // ----- DOUBLE-BACKSPACE LOGIC -----
        if ( event.key === "Backspace" ) {
            const now = Date.now();
            const elapsed = now - lastBackspaceTime;

            // If two backspaces within 250ms → remove last key level #a6c94e
            if ( elapsed < 250 ) {
                event.preventDefault();

                const parts = path.split( "." );
                parts.pop(); // remove last segment
                const newPath = parts.join( "." );

                setPath( newPath );
                requestAnimationFrame(moveCaretToEnd);
            }

            setLastBackspaceTime(now);
        }
    };

    return {
        handleFocus,
        handleKeyDown,
        moveCaretToEnd,
        handleChange
    }
}

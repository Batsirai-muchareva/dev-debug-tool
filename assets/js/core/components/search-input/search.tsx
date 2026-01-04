import React, { ChangeEvent, useEffect } from "react"
import { bemBlock } from "@app/utils/bem";
import { useFilteredData } from "@app/context/filter-context";
import { SEARCH_POPOVER_KEY, usePopover } from "@app/context/popover-context";
import { useRef, useState } from "@wordpress/element";
import { useEventBus } from "@app/hooks/use-event-bus";
import { Filter } from "@component/search-input/filter";

export const Search = ( { disabled }: { disabled: boolean } ) => {
    const { open: openSearchPopover, isOpen, close: closeSearchPopover } = usePopover( SEARCH_POPOVER_KEY );
    const { setPath, path, paths } = useFilteredData();
    const inputRef = useRef<HTMLInputElement>(null );
    const [ ghostText, setGhostText ] = useState( '' )
    const [lastBackspaceTime, setLastBackspaceTime] = useState<number>(0);

    useEventBus( 'suggestion:select', () => moveCaretToEnd() )

    useEffect( () => {
        if ( paths.includes( path ) ) {
            setGhostText( '' );
        } else if ( path === '' ) {
            setGhostText( '' );
        } else {
            setGhostText( paths[0] ?? '' );
        }
    }, [ paths ] );

    const handleFocus = () => {
        moveCaretToEnd();
    }

    const handleChange = ( event: ChangeEvent<HTMLInputElement> ) => {
        setPath( event.target.value );

        if ( ! isOpen ) {
            openSearchPopover();
        }
    }

    const moveCaretToEnd = () => {
        if ( ! inputRef.current ) {
            return;
        }

        const input = inputRef.current;
        const length = input.value.length;

        // Set selection to end
        requestAnimationFrame( () => {
            input.setSelectionRange(length, length);
            // Scroll to show the end of the text
            input.scrollLeft = input.scrollWidth + 10;
        } );
    };

    const clearInput = () => {
        setPath('');
        inputRef.current?.focus();
    };

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

    return (
        <div style={{ display: 'flex', gap: '10px'}}>
            <div style={{flex: 1}} className={ bemBlock.element( 'path-input' ) }>
            <input
                disabled={ disabled }
                ref={ inputRef }
                value={ path }
                placeholder="e.g., settings.title.value"
                onChange={ handleChange }
                onFocus={ handleFocus }
                onBlur={ moveCaretToEnd }
                onKeyDown={ handleKeyDown }
            />
             <span className="ghost-text" id="ghost">{ ghostText }</span>
                         { path && (
                             <button
                                 onClick={ clearInput }
                                 className={ bemBlock.element( 'path-input-clear' ) }
                                 aria-label="Clear input"
                             >
                    <i className="eicon-close"/>
            </button>
                         ) }
        </div>
            {/*<Filter />*/}
        </div>
     )
}

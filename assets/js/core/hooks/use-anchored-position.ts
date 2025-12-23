import { useRef } from "@wordpress/element";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { listenToEvent } from "@app/events/listeners/listen-to-event";
import { DRAG_POPOVER_EVENT, RESIZE_POPOVER_EVENT } from "@app/events/event-lists";

export const useAnchoredPosition = ( anchor?: HTMLElement | null, width = 300, side = 'left') => {
    const [ position, setPosition ] = useState( { top: 0, left: 0 } );
    const popoverRef = useRef<HTMLElement | null>( null );

    const calculatePosition = useCallback( () => {
        if ( ! anchor || ! popoverRef.current ) {
            return;
        }

        const rect = anchor.getBoundingClientRect();
        const popRect = popoverRef.current.getBoundingClientRect();

        const positions: Record<string, { left: number; top: number }> = {
            left: {
                top: rect.top + window.scrollY,
                left: rect.left - popRect.width + window.scrollX
            },
            right: {
                top: rect.top + window.scrollY,
                left: rect.right + window.scrollX
            },
            top: {
                top: rect.top - popRect.height + window.scrollY,
                left: rect.left + window.scrollX
            },
            bottom: {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            }
        };

        setPosition( positions[ side ] );
    }, [anchor, side]);

    useLayoutEffect(() => {
        calculatePosition();
    }, [ calculatePosition ]);

    useEffect( () => {
        return listenToEvent( [ DRAG_POPOVER_EVENT, RESIZE_POPOVER_EVENT ], calculatePosition );
    }, [ calculatePosition ] );

    return {
        styles: {
            top: position.top,
            left: position.left,
            width
        },
        ref: popoverRef
    };
};

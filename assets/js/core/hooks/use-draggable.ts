import { useEffect, useRef } from "@wordpress/element";
import { useBounds } from "@app/context/bounds-context";
import { editorPointerEvents } from "@app/utils/editor-pointer-events";
import { dispatchCustomEvent } from "@app/events/dispatcher/dispatch-custom-event";
import { DRAG_POPOVER_EVENT } from "@app/events/event-lists";
import { listenToEvent } from "@app/events/listeners/listen-to-event";

export function useDraggable() {
    const { position, setPosition } = useBounds();

    const dragStateRef = useRef( {
        isDragging: false,
        startPos: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 }
    } );

    const startDrag = ( e: any ) => {
        e.preventDefault();

        dragStateRef.current = {
            isDragging: true,
            startPos: { x: e.clientX, y: e.clientY },
            startPosition: { x: position.x, y: position.y }
        };

        editorPointerEvents( true );
    };

    const stopDrag = () => {
        dragStateRef.current.isDragging = false;

        editorPointerEvents( false );
    };

    const handleDrag = ( e: any ) => {
        const state = dragStateRef.current;
        if ( ! state.isDragging ) {
            return
        }

        const deltaX = e.clientX - state.startPos.x;
        const deltaY = e.clientY - state.startPos.y;

        setPosition( {
            x: state.startPosition.x + deltaX,
            y: state.startPosition.y + deltaY
        } );

        dispatchCustomEvent( DRAG_POPOVER_EVENT )
    };

    useEffect( () => {
        const cleanups = [
            listenToEvent( 'mousemove', handleDrag ),
            listenToEvent( 'mouseup', stopDrag )
        ];

        return () => cleanups.forEach( fn => fn() );
    }, []);

    return {
        startDrag
    }
}

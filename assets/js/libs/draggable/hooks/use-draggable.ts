import { useRef } from "@wordpress/element";
import { useBounds } from "@app/context/bounds-context";
import { editorPointerEvents } from "@app/utils/editor-pointer-events";
import { useEventBus } from "@app/hooks/use-event-bus";
import { windowAdapter } from "@app/adapters";
import { EventMap } from "@app/events/event-map";

export function useDraggable() {
    const { position, setPosition } = useBounds();

    const dragStateRef = useRef( {
        isDragging: false,
        startPos: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 }
    } );

    const startDrag = ( e: any ) => {
        e.preventDefault();

        windowAdapter.attachMouseEvents();

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

    const handleDrag = ( e: EventMap['window:mousemove'] ) => {
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

        // dispatchCustomEvent( DRAG_POPOVER_EVENT )
    };

    useEventBus( 'window:mousemove', handleDrag )

    useEventBus( 'window:mouseup', stopDrag )

    return {
        startDrag
    }
}

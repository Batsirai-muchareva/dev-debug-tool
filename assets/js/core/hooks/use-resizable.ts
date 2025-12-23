import { useBounds } from "@app/context/bounds-context";
import React, { useRef } from "react";
import { DIRECTION } from "@app/libs/resizable/types";
import { editorPointerEvents } from "@app/utils/editor-pointer-events";
import { calculateNewDimensions } from "@app/libs/resizable/calculate-new-dimension";
import { applyConstraints } from "@app/libs/resizable/apply-constraints";
import { useEffect } from "@wordpress/element";
import { dispatchCustomEvent } from "@app/events/dispatcher/dispatch-custom-event";
import { RESIZE_POPOVER_EVENT } from "@app/events/event-lists";
import { listenToEvent } from "@app/events/listeners/listen-to-event";

type RefState = {
    isResizing: boolean;
    direction: DIRECTION | null,
    startSize: {
        width: number,
        height: number
    },
    startPos: {
        x: number;
        y: number;
    }, // what is this
    startPosition: {
        x: number;
        y: number;
    }
}

export const useResizable = ( minConstraints: number[], maxConstraints: number[] ) => {
    const { position, setPosition, size, setSize } = useBounds();

    const resizeStateRef = useRef<RefState>( {
        isResizing: false,
        direction: null,
        startSize: { width: 0, height: 0 },
        startPos: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 }
    } );

    const constraints = {
        minWidth: minConstraints[0],
        minHeight: minConstraints[1],
        maxWidth: maxConstraints[0],
        maxHeight: maxConstraints[1]
    };

    const startResize = ( e: React.MouseEvent, direction: DIRECTION ) => {
        e.preventDefault();

        resizeStateRef.current = {
            isResizing: true,
            direction,
            startSize: { width: size.width, height: size.height },
            startPos: { x: e.clientX, y: e.clientY },
            startPosition: { x: position.x, y: position.y }
        };

        editorPointerEvents( true );
    }

    const stopResize = () => {
        if ( resizeStateRef.current.isResizing ) {
            resizeStateRef.current.isResizing = false;
            editorPointerEvents( false );
        }
    };

    const handleMouseUp = () => {
        stopResize();
    };


    const handleResize = ( e: any ) => {
        const state = resizeStateRef.current;

        if ( ! state.isResizing ) {
            return
        }

        const delta = {
            x: e.clientX - state.startPos.x,
            y: e.clientY - state.startPos.y
        };

        const startState = {
            width: state.startSize.width,
            height: state.startSize.height,
            posX: state.startPosition.x,
            posY: state.startPosition.y
        };

        const newDimensions = calculateNewDimensions(
            state.direction as DIRECTION,
            startState,
            delta
        );

        let constrained: { width: number; height: number; x?: number; y?: number } = applyConstraints( newDimensions, constraints );

        if ( constrained.width === constraints.maxWidth || constrained.width === constraints.minWidth ) {
            delete constrained.x;
        }

        if ( constrained.height === constraints.maxHeight || constrained.height === constraints.minHeight ) {
            delete constrained.y;
        }

        const { width, height, x, y } = constrained

        setSize( { width, height } );
        setPosition( ( prev ) => {
            const newPosition = { ...prev };

            // Update x if it exists (west/northwest/southwest resize)
            if ( x !== undefined ) {
                newPosition.x = x;
            }

            // Update y if it exists (north/northeast/northwest resize)
            if ( y !== undefined ) {
                newPosition.y = y;
            }

            return newPosition;

            //
            // if ( x  ) {
            //     return { ...prev, x };
            // }
            //
            // if ( y ) {
            //     return { ...prev, y };
            // }
            //
            // if ( x && y ) {
            //     return {  x, y };
            // }
            //
            // return prev
        } );

        dispatchCustomEvent( RESIZE_POPOVER_EVENT )
    }

    useEffect( () => {
        const cleanups = [
            listenToEvent( 'mousemove', handleResize ),
            listenToEvent( 'mouseup', handleMouseUp )
        ];

        return () => cleanups.forEach( fn => fn() );
    }, []);

    return {
        startResize
    }
}

import React from "react";
import { PropsWithChildren, useRef } from "react";
import { calculateNewDimensions } from "./calculate-new-dimension";
import { DIRECTION } from "./types";
import { applyConstraints } from "./apply-constraints";
import { useEffect } from "@wordpress/element";
import { ResizeBarHandle } from "./handles/resize-bar-handle";
import { useBounds } from "../../context/bounds-context";
import { editorPointerEvents } from "../../utils/editor-pointer-events";

const RESIZE_DIRECTIONS = {
    NORTH: 'n',
    SOUTH: 's',
    WEST: 'w',
    EAST: 'e',
    NORTH_WEST: 'nw',
    NORTH_EAST: 'ne',
    SOUTH_WEST: 'sw',
    SOUTH_EAST: 'se',
};

const edgeHandles = [
    { dir: RESIZE_DIRECTIONS.NORTH, className: 'dev-debug-resizable__handle-n' },
    { dir: RESIZE_DIRECTIONS.SOUTH, className: 'dev-debug-resizable__handle-s' },
    { dir: RESIZE_DIRECTIONS.WEST, className: 'dev-debug-resizable__handle-w' },
    { dir: RESIZE_DIRECTIONS.EAST, className: 'dev-debug-resizable__handle-e' }
];

type Props = PropsWithChildren & {
    minConstraints?: number[];
    maxConstraints?: number[];
};

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

export const Resizable = ( { children, minConstraints = [100, 100], maxConstraints = [1000, 1000] }: Props ) => {
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


    const handleResize = ( e: MouseEvent ) => {
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

        const newDimensions = calculateNewDimensions( state.direction as DIRECTION, startState, delta );
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

            if ( x  ) {
                return { ...prev, x };
            }

            if ( y ) {
                return { ...prev, y };
            }

            if ( x && y ) {
                return {  x, y };
            }

            return prev
        } );
    }

    useEffect( () => {

        document.addEventListener( 'mousemove', handleResize );
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener( 'mousemove', handleResize );
            document.removeEventListener('mouseup', handleMouseUp );
        };
    }, []);
// lets use hooks for all this logic

    const styles = {
        width: `${ size.width }px`,
        height: `${ size.height }px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
    }

    return (
        <div className="dev-debug-resizable" style={ styles }>
            { children }

            { edgeHandles.map( ( { dir, className } ) => (
                <ResizeBarHandle
                    key={ dir }
                    className={ className }
                    onMouseDown={ ( e) => startResize( e, dir as DIRECTION ) }
                />
            ))}
        </div>
    )
}

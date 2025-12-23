import React from "react";
import { PropsWithChildren } from "react";
import { useEffect, useRef } from "@wordpress/element";
import { useBounds } from "../../context/bounds-context";
import { editorPointerEvents } from "../../utils/editor-pointer-events";

type Props = PropsWithChildren & {
    className: string;
}

export const Draggable = ( { children, className }: Props ) => {
    const { position, setPosition } = useBounds();

    const dragStateRef = useRef( {
        isDragging: false,
        startPos: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 }
    } );

    const startDrag = (e: any) => {
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

    const handleDrag = (e: any) => {
        const state = dragStateRef.current;
        if (!state.isDragging) return;

        const deltaX = e.clientX - state.startPos.x;
        const deltaY = e.clientY - state.startPos.y;

        setPosition({
            x: state.startPosition.x + deltaX,
            y: state.startPosition.y + deltaY
        });
    };


    useEffect(() => {
        document.addEventListener( 'mousemove', handleDrag );
        document.addEventListener( 'mouseup', stopDrag );

        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
    }, []);

    return (
        <div className={ `dev-debug-draggable ${ className }` } onMouseDown={ startDrag }>
            { children }
        </div>
    );
}

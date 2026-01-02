import React from "react";
import { PropsWithChildren } from "react";

import { DIRECTION } from "@libs/resizable/types";
import { ResizeBarHandle } from "@libs/resizable/handles/resize-bar-handle";
import { useResizable } from "@libs/resizable/hooks/use-resizable";
import { ResizeCornerHandle } from "@libs/resizable/handles/resize-corner-handle";

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
    { dir: RESIZE_DIRECTIONS.NORTH, className: 'edge-n' },
    { dir: RESIZE_DIRECTIONS.SOUTH, className: 'edge-s' },
    { dir: RESIZE_DIRECTIONS.WEST, className: 'edge-w' },
    { dir: RESIZE_DIRECTIONS.EAST, className: 'edge-e' }
];

const cornerHandles = [
    { dir: RESIZE_DIRECTIONS.NORTH_WEST, className: 'corner-nw' },
    { dir: RESIZE_DIRECTIONS.NORTH_EAST, className: 'corner-ne' },
    { dir: RESIZE_DIRECTIONS.SOUTH_WEST, className: 'corner-sw' },
    { dir: RESIZE_DIRECTIONS.SOUTH_EAST, className: 'corner-se' }
];

type Props = PropsWithChildren & {
    minConstraints?: number[];
    maxConstraints?: number[];
};

export const Resizable = ( { children, minConstraints = [100, 100], maxConstraints = [1000, 1000] }: Props ) => {
    const { startResize } = useResizable( minConstraints, maxConstraints );
    const classPrefix = 'resizable__handle-'

    return (
        <>
            { children }

            { edgeHandles.map( ( { dir, className } ) => (
                <ResizeBarHandle
                    key={ dir }
                    className={ classPrefix + className }
                    onMouseDown={ ( e) => startResize( e, dir as DIRECTION ) }
                />
            ))}

            { cornerHandles.map( ( { dir, className } ) => (
                <ResizeCornerHandle
                    key={ dir }
                    className={ classPrefix + className }
                    onMouseDown={ ( e) => startResize( e, dir as DIRECTION ) }
                />
            ))}
        </>
    )
}

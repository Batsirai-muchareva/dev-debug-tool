import React from "react";
import { PropsWithChildren } from "react";

import { DIRECTION } from "@app/libs/resizable/types";
import { useResizable } from "@app/hooks/use-resizable";
import { ResizeBarHandle } from "@app/libs/resizable/handles/resize-bar-handle";

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
    { dir: RESIZE_DIRECTIONS.NORTH, className: 'resizable__handle-n' },
    { dir: RESIZE_DIRECTIONS.SOUTH, className: 'resizable__handle-s' },
    { dir: RESIZE_DIRECTIONS.WEST, className: 'resizable__handle-w' },
    { dir: RESIZE_DIRECTIONS.EAST, className: 'resizable__handle-e' }
];

type Props = PropsWithChildren & {
    minConstraints?: number[];
    maxConstraints?: number[];
};

export const Resizable = ( { children, minConstraints = [100, 100], maxConstraints = [1000, 1000] }: Props ) => {
    const { startResize } = useResizable( minConstraints, maxConstraints );

    return (
        <>
            { children }

            { edgeHandles.map( ( { dir, className } ) => (
                <ResizeBarHandle
                    key={ dir }
                    className={ className }
                    onMouseDown={ ( e) => startResize( e, dir as DIRECTION ) }
                />
            ))}
        </>
    )
}

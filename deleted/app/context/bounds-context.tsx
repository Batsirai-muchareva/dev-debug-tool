import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { createContext, useContext, useEffect } from "@wordpress/element";
import { PropsWithChildren, useState } from "react";
import { listenTo, POPOVER_OPEN_EVENT, POSITION_CHANGE_EVENT, WINDOW_RESIZE_EVENT } from "../events";
import { usePopover } from "./popover-context";

const INITIAL_HEIGHT = 500;
const INITIAL_WIDTH = 300;

type Position = {
    x: number;
    y: number
};

type Size = {
    height: number;
    width: number;
}

type SetState<T> = Dispatch< SetStateAction< T > >;

type BoundsContextValue = {
    position: Position;
    setPosition: SetState<Position>;
    size: Size;
    setSize: SetState<Size>;
};

const BoundsContext = createContext< BoundsContextValue | undefined >( undefined );

export const BoundsProvider = ( { children }: PropsWithChildren ) => {
    const [ position, setPosition ] = useState<Position>( { x: 0, y: 0 } );
    const [ size, setSize ] = useState<Size>( { width: INITIAL_WIDTH, height: INITIAL_HEIGHT } );
    const popover = usePopover();

    useEffect( () => {
        if ( ! popover.isOpen ) return;

        return listenTo( POSITION_CHANGE_EVENT, ( event: any ) => {
            setPosition( { x: event.detail.left, y: event.detail.top } )
        } );
    }, [ popover.isOpen ] );

    useEffect( () => {
        if ( ! popover.isOpen ) return;

        return listenTo( [ POPOVER_OPEN_EVENT, WINDOW_RESIZE_EVENT ], ( event: any ) => {

            setPosition( {
                x: event.detail.left - size.width,
                y: event.detail.top - size.height
            } );
        } );
    }, [ popover.isOpen ] );

    return (
        <BoundsContext.Provider value={ { position, setPosition, size, setSize } }>
            { children }
        </BoundsContext.Provider>
    );
};

export const useBounds = () => {
    const context = useContext( BoundsContext );

    if ( ! context ) {
        throw new Error("useBounds must be used within a BoundsProvider");
    }

    return context;
};

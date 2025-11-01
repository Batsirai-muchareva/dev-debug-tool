import * as React from "react";
import { createContext, useContext } from "@wordpress/element";
import { PropsWithChildren, useState } from "react";

type Position = {
    x: number;
    y: number
};

type CreatePositionContext = {
    position: Position;
    setPosition:  React.Dispatch<React.SetStateAction< Position > >;
};

const PositionContext = createContext< CreatePositionContext | undefined>( undefined );

export const PositionProvider = ( { children }: PropsWithChildren ) => {
    const [ position, setPosition ] = useState( { x: 0, y: 0} );

    return (
        <PositionContext.Provider value={ { position, setPosition } }>
            {children}
        </PositionContext.Provider>
    );
};

export const usePosition = () => {
    const context = useContext( PositionContext );

    if (!context) {
        throw new Error("usePosition must be used within a PositionProvider");
    }

    return context;
};

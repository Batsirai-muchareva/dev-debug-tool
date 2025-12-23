import * as React from "react";
import { createContext, useContext, useState } from "@wordpress/element";
import { PropsWithChildren } from "react";

type PopoverState = {
    isOpen: boolean,
    togglePopover: () => void,
};

const PopoverContext = createContext<PopoverState>( undefined as any );

export const PopoverProvider = ( { children }: PropsWithChildren ) => {
    const [ isOpen, setOpen ] = useState( false );

    function togglePopover() {
        setOpen( ! isOpen );
    }

    return (
        <PopoverContext.Provider value={ { isOpen, togglePopover } }>
            { children }
        </PopoverContext.Provider>
    );
};

export const usePopover = () => {
    const context = useContext( PopoverContext )

    if ( ! context ) {
        throw new Error("usePopover must be used within a PopoverProvider");
    }

    return context;
}

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "@wordpress/element";
import { PropsWithChildren } from "react";
import { listenTo, POPOVER_OPEN_EVENT, POSITION_CHANGE_EVENT, WINDOW_RESIZE_EVENT } from "../events";
import { useBounds } from "./bounds-context";

type PopoverState = {
    isOpen: boolean,
    toggle: () => void,
};

const PopoverContext = createContext<PopoverState>( undefined as any );

export const PopoverProvider = ( { children }: PropsWithChildren ) => {
    const [ isOpen, setOpen ] = useState( false );

    function toggle() {
        setOpen( ! isOpen );
    }

    return (
        <PopoverContext.Provider value={ { isOpen, toggle } }>
            {children}
        </PopoverContext.Provider>
    );
};

export const usePopover = () => {
    const context = useContext( PopoverContext )

    if ( ! context) {
        throw new Error("usePopover must be used within a PopoverProvider");
    }

    return context;
}

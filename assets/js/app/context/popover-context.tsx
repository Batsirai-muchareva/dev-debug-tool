import { createContext, useContext, useState } from "@wordpress/element";
import { Popover } from "../components/popover";
import * as React from "react";

type PopoverState = {
    isOpen: boolean,
    toggle: () => void,
};

const PopoverContext = createContext<PopoverState>( undefined );

export const PopoverProvider = ({ children }) => {
    const [ isOpen, setOpen ] = useState( false );

    function toggle() {
        setOpen( ! isOpen )
    }

    return (
        <PopoverContext.Provider value={ { isOpen, toggle } }>
            {children}
            <Popover />
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

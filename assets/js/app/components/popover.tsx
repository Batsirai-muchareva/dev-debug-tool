import * as React from "react";
import { Resizable } from "../libs/resizable/resizable";
import { Tabs } from "./tabs/tabs";
import { Draggable } from "../libs/draggable/draggable";
import { usePopover } from "../context/popover-context";

export const Popover = () => {
    const popover = usePopover();

    if ( ! popover.isOpen ) {
        return null;
    }

    return (
        <Resizable>
            <Draggable className="dev-debug__popover-header">
                <p>Dev Debug Tool</p>
                <button className="dev-debug-tool-close">
                    <i className="eicon-close"></i>
                </button>
            </Draggable>
            <Tabs />
        </Resizable>
    );
};

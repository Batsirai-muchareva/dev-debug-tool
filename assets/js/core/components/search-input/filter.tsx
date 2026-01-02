import React, { useState } from "react"
import { Popover } from "@component/popover/popover";
import { PopoverContent } from "@component/popover/popover-content";
import { usePopover } from "@app/context/popover-context";
import { useRef } from "@wordpress/element";
import { Tabs } from "@component/tabs/tabs";
import { Tab } from "@component/tabs/tab";
import { TabContent } from "@component/tabs/tab-content";
import { Padding } from "@component/ui/padding";
import { bemBlock } from "@app/utils/bem";

export const Filter = () => {
    const { open } = usePopover( 'Filter' );
    const [ node, setNode ] = useState<HTMLButtonElement>();

    const setRef = ( btnNone: HTMLButtonElement ) => {
        setNode( btnNone )
    };

    return (
        <>
        <button style={{
            background: '#1f5a58',
            cursor: 'pointer',
            borderRadius: '10px',
            padding: '2px 11px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            boxShadow: '0px 1px color(srgb 0.14 0.17 0.17), 0px -1px color(srgb 0.14 0.17 0.17), 1px 0px color(srgb 0.14 0.17 0.17), -1px 0px color(srgb 0.14 0.17 0.17), 0 0px 3px rgba(0, 0, 0, 0.3), inset 0 0 18px rgba(0, 0, 0, 0.42)'
        }} ref={ setRef } onClick={ open }>
            <i className="eicon-taxonomy-filter"/>
        </button>

            <Popover width={ 200 } gutter={ { top: 0, left: 0 } } anchor={ node } id="Filter" >
                <PopoverContent>
                   <Padding>
                       <Item name="one" />
                       {/*<div>sfvsvds</div>*/}
                       {/*<div>sfvsvds</div>*/}
                       {/*<div>sfvsvds</div>*/}
                       {/*<div>sfvsvds</div>*/}
                   </Padding>
                </PopoverContent>
            </Popover>
        </>
    )
}
// className="key-item ${selectedKeys.has(key.name) ? 'selected' : ''}"
const Item = ( { name }: { name: string } ) => {
    const [ selected, setSelected ] = useState<string[]>();

    return (
        <div
            className={ bemBlock.condElemMod( 'filter-item', 'selected', true ) }
            onClick={ () => {
                setSelected( prevState => {
                    return [ ...prevState ?? [], name ]
                } )
            } }
        >
            <div className={ bemBlock.element( 'filter-checkbox' )}></div>
            <div className={ bemBlock.element( 'filter-name' )}>${ name }</div>
            {/*<div className="key-type">${ key.type }</div>*/}
        </div>
    )
}

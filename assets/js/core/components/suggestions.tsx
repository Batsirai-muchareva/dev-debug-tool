import React, { useCallback } from "react"
import { useFilteredData } from "@app/context/filter-context";
import { bemBlock } from "@app/utils/bem";
import { useState } from "@wordpress/element";
import { dispatchCustomEvent } from "@app/events/dispatcher/dispatch-custom-event";
import { SELECT_SUGGESTION_EVENT } from "@app/events/event-lists";

const bemClass = bemBlock.elementClass( 'suggestion' );

const truncatePath = (p: any) => {
    if (p.length <= 30) return p;
    const start = p.substring(0, 10);
    const end = p.substring(p.length - 20);
    return `${start}...${end}`;
};


export const Suggestions = () => {
    const { suggestions } = useFilteredData();
    const { setPath, path } = useFilteredData()

    const handleSelection = ( path: string ) => {
        setPath( path );
        dispatchCustomEvent( SELECT_SUGGESTION_EVENT );
    };

    return (
        <div className={ bemBlock.element( 'suggestion' ) }>

            { suggestions.length === 0 && <div style={{ textAlign: 'center',
                margin: '30px',
                color: '#a0a0a0'} }> No matched path results </div>}

            { suggestions.map( ( category ) => (
                <div key={ category.key }>
                    <div className={ bemBlock.element( 'suggestion-category' ) }>
                        { category.label }
                    </div>

                    { category.items.map( ( item: any, index: number ) => (
                        <div
                            key={ index }
                            onClick={ () => handleSelection( item.path ) }
                            className={ bemBlock.condElemMod( 'suggestion-item', 'selected', item.path === path ) }
                            data-path={ item.path }>

                            <span className={ bemClass( 'icon' ) }> { category.icon } </span>
                            <div className={ bemClass( 'content' ) }>
                                <div className={ bemClass( 'path' ) }> { truncatePath(item.path) }</div>
                                <div className={ bemClass( 'desc' ) }>{ item.value }</div>
                            </div>

                        </div>
                    ) ) }

                </div>
            ) ) }

    </div>
    )
}






// search nodes in json path
// <div onClick={ () => handleSelection( suggestion.path ) }
//      className={ bemBlock.condElemMod( 'suggestion-item', 'selected', index === selectedIndex ) } bemClass( 'item' )
//      key={ suggestion.path }>
//         <div className={ bemBlock.element( 'suggestion-path' ) }>{ suggestion.path }</div>
//         <div className={ bemBlock.element( 'suggestion-value' ) }>{ suggestion.value }</div>
// </div>

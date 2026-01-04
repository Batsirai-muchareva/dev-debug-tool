import React, { useEffect } from "react"
import { bemBlock } from "@app/utils/bem";
import { useFilteredData } from "@app/context/filter-context";
import { eventBus } from "@app/events";

export const BrowseView = ( { onSelect, selectedKey }: { onSelect: ( key: string ) => void, selectedKey: string } ) => {
    const { data } = useFilteredData();

    const onKeySelect = ( key: string ) => {
        onSelect( key );
    }

    return (
        <div className={ bemBlock.element( 'browse-view' ) }>
            <div className={ bemBlock.element( 'browse-view-header' ) }>
                <strong>59 Schema</strong>
            </div>
            <div className={ bemBlock.element( 'browse-view-list' ) }>
               { ( data as [] ).map( ( key, index ) =>
                   <Item
                       key={ key }
                       index={ index }
                       label={ key }
                       onClick={ () => onKeySelect( key ) }
                   />
               ) }
            </div>
        </div>
    )
}

const Item = ( { index, label, onClick }: { index: number; label: string; onClick?: () => void } ) => {
    return (
        <button onClick={ onClick } className={ bemBlock.element( 'browse-view-list-item' ) }>
            <span className={ bemBlock.element( 'browse-view-list-item-index' ) }>
                { index + 1 }
            </span>

            <span className={ bemBlock.element( 'browse-view-list-item-key' ) }>
                { label }
            </span>

            <span className={ bemBlock.element( 'browse-view-list-item-arrow' ) }>
                →
            </span>
        </button>
    );
}



//     if (!dataSource.isAvailable()) {
//         return (
//             <div className="schema-browser schema-browser--unavailable">
//                 <div className="schema-browser__unavailable-message">
//                     Data source not available
//                 </div>
//             </div>
//         );
//     }

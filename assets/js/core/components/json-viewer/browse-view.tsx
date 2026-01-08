import React from "react"
import { bemBlock } from "@app/utils/bem";
import { useBrowse } from "@app/context/browse-context";
import { useResolvedData } from "@app/context/data/resolved-data-context";
import { usePath } from "@app/context/path-context";

export const BrowseView = () => {
    const { setSelectedKey } = useBrowse();
    const { data } = useResolvedData();
    const { path, setPath } = usePath();

    const getKeys = () => {
        return Object.keys( data as Record<string, unknown> ?? {} );
    }

    const onKeySelect = ( key: string ) => {
        setSelectedKey( key );

        setPath( '' );
    }

    const filteredData = getKeys().filter( ( key ) => {
        return key.includes( path );
    } );

    return (
        <div className={ bemBlock.element( 'browse-view' ) }>
            <div className={ bemBlock.element( 'browse-view-header' ) }>
                <strong>59 Schema</strong>
            </div>
            <div className={ bemBlock.element( 'browse-view-list' ) }>
               { filteredData.map( ( key, index ) =>
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

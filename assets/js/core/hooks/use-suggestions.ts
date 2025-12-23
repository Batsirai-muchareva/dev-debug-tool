import { useMemo } from "react";
import { getValueTypes, resolveValueType } from "@app/suggestions/register-value-types";

export interface PathSuggestion {
    path: string;
    value: string;
    type: string;
}

export const useSuggestions = ( allPaths: string[], getPathValue: ( path: string ) => any ) => {
    return useMemo( () => {
        const grouped: Record<string, PathSuggestion[]> = {};
        const valueTypes = getValueTypes();

        for ( const handler of valueTypes ) {
            grouped[handler.type] = [];
        }

        allPaths.forEach( path => {
            const value = getPathValue( path );
            const handler = resolveValueType( value );

            if ( handler.isEmpty?.( value ) ) {
                return;
            }

            // how about i want to filter empty values
            grouped[ handler.type ].push( {
                path,
                type: handler.type,
                value: handler.format(value)
            } );
        } );

        return valueTypes
            .map( handler  => ({
                key: handler.type,
                name: handler.meta.name,
                icon: handler.meta.icon,
                label: handler.meta.label,
                items: grouped[handler.type].slice(0, 10)
            }))
            .filter( cat => cat.items.length > 0 );


        // const grouped: Record<string, PathSuggestion[]> = {
        //     object: [],
        //     array: [],
        //     string: [],
        //     number: [],
        //     boolean: [],
        //     null: []
        // };

        // allPaths.forEach( ( foundPath: any ) => {
        //     const value = getPathValue( foundPath );
        //     let type: PathSuggestion['type'];
        //     let displayValue: string;
        //
        //     if ( value === null ) {
        //         type = 'null';
        //         displayValue = 'null';
        //     } else if ( Array.isArray( value ) ) {
        //         type = 'array';
        //         displayValue = `Array (${ value.length } items)`;
        //     } else if ( typeof value === 'object' ) {
        //         type = 'object';
        //         const keys = Object.keys( value );
        //         displayValue = `Object with (${ keys.length } properties)`;
        //     } else if ( typeof value === 'string' ) {
        //         type = 'string';
        //         displayValue = value.length > 50 ? `"${ value.substring( 0, 50 ) }..."` : `"${ value }"`;
        //     } else if ( typeof value === 'number' ) {
        //         type = 'number';
        //         displayValue = String( value );
        //     } else if ( typeof value === 'boolean' ) {
        //         type = 'boolean';
        //         displayValue = String( value );
        //     } else {
        //         type = 'string';
        //         displayValue = String( value );
        //     }
        //
        //     grouped[ type ].push( {
        //         path: foundPath,
        //         value: displayValue,
        //         type
        //     } );
        // } );

        // Convert to array of categories with metadata
        // const categoryConfigs: Array<{
        //     key: keyof typeof grouped;
        //     name: string;
        //     icon: string;
        //     label: string;
        // }> = [
        //     { key: 'object', name: 'Objects', icon: '📦', label: 'Object' },
        //     { key: 'array', name: 'Arrays', icon: '📚', label: 'Array' },
        //     { key: 'string', name: 'Strings', icon: '📝', label: 'String' },
        //     { key: 'number', name: 'Numbers', icon: '🔢', label: 'Number' },
        //     { key: 'boolean', name: 'Booleans', icon: '✓', label: 'Boolean' },
        //     { key: 'null', name: 'Null Values', icon: '∅', label: 'Null' }
        // ];

        // return categoryConfigs
            // .map( config => ( {
            //     name: config.name,
            //     key: config.key,
            //     icon: config.icon,
            //     label: config.label,
            //     items: grouped[ config.key ].slice( 0, 10 )
            // } ) )
            // .filter( category => category.items.length > 0 ); // Only return categories with items
    }, [ allPaths ])
};



// const getValue = ( foundPath: string ) => {
//     const value = getValueFromPath( data, foundPath );
//
//     return typeof value === 'object' ? 'Object' : String( value );
// }

// const filtered = allPaths
//     .filter( p => p.toLowerCase().includes( query.toLowerCase() ) )
//     .slice( 0, 10 )
//     .map( foundPath => ( {
//         path: foundPath,
//         value: getValue( foundPath ),
//     } ) );
//
// const filtered = allPaths
//     .filter( p => p.toLowerCase().includes( query.toLowerCase() ) )
//     .slice( 0, 50 ); // Increased to 50 to have enough for all categories

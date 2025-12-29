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

    }, [ allPaths ])
};

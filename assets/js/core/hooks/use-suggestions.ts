import { useMemo } from "react";
import { getValueTypes, resolveValueType } from "@app/suggestions/register-value-types";
import { getAllJsonPaths } from "@app/utils/get-all-json-paths";
import { useResolvedData } from "@app/context/data/resolved-data-context";
import { createPathValueGetter } from "@app/utils/create-path-value-getter";
import { useSearch } from "@app/hooks/use-search";
import { usePath } from "@app/context/path-context";

export interface PathSuggestion {
    path: string;
    value: string;
    type: string;
}

export const useSuggestions = () => {
    const { path: search } = usePath();
    const { rootData } = useResolvedData();
    const getDataAtPath = createPathValueGetter( rootData );
    const paths = useMemo( () => getAllJsonPaths( rootData ), [ rootData ] );
    const filteredPaths = useSearch( paths, search );

    const suggestions = useMemo( () => {
        const grouped: Record<string, PathSuggestion[]> = {};
        const valueTypes = getValueTypes();

        for ( const handler of valueTypes ) {
            grouped[handler.type] = [];
        }

        filteredPaths.forEach( path => {
            const value = getDataAtPath( path );
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

    }, [ filteredPaths ]);

    return {
        paths: filteredPaths,
        suggestions,
    }
};

//






// export const useJsonPathSearch = ( data: any, query: string ) => {
//     const paths = useMemo( () => getAllJsonPaths( data ), [ data ] );
//
//     return useMemo( () => paths
//             .filter(p =>
//                 normalizeQuery(p).includes(normalizeQuery(query))
//             )
//             // .filter( ( p: string ) => p.toLowerCase().includes( query.toLowerCase() ) )
//             .slice( 0, MAX_ITEMS )
//         , [ query, paths ] );
// }
//
// const normalizeQuery = (q: string) =>
//     q
//         .replace(/\.(\d+)(?=\.|$)/g, "[$1]") // variants.0 → variants[0]
//         .replace(/\[\s*(\d+)\s*]/g, "[$1]") // clean spacing
//         .toLowerCase();

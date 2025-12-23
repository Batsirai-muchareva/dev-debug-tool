import { useMemo } from "react";
import { getAllJsonPaths } from "@app/utils/get-all-json-paths";

const MAX_ITEMS = 10;

export const useJsonPathSearch = ( data: any, query: string ) => {
    const paths = useMemo( () => getAllJsonPaths( data ), [ data ] );

    return useMemo( () => paths
            .filter(p =>
                normalizeQuery(p).includes(normalizeQuery(query))
            )
        // .filter( ( p: string ) => p.toLowerCase().includes( query.toLowerCase() ) )
        .slice( 0, MAX_ITEMS )
    , [ query, paths ] );
}

const normalizeQuery = (q: string) =>
    q
        .replace(/\.(\d+)(?=\.|$)/g, "[$1]") // variants.0 → variants[0]
        .replace(/\[\s*(\d+)\s*]/g, "[$1]") // clean spacing
        .toLowerCase();
//   //
//     // if ( ! query ) {
//     //     return [];
//     // }
//     // if query is empty return all
//     // if query is categories return exact match but if not exact match
// Increased to 50 to have enough for all categories

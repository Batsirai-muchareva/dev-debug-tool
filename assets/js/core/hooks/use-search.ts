import { useMemo } from "react";

const MAX_ITEMS = 10;

export const useSearch = ( items: string[], query: string ) => {

    return useMemo( () => items
            .filter( p =>
                normalizeQuery( p ).includes( normalizeQuery( query ) )
            )
        .slice( 0, MAX_ITEMS )
    , [ query, items ] );
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
// .filter( ( p: string ) => p.toLowerCase().includes( query.toLowerCase() ) )

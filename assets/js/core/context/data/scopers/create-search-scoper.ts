import { DataScoper } from "@app/context/data/types";
import { usePath } from "@app/context/path-context";
import { createPathValueGetter } from "@app/utils/create-path-value-getter";

export const createSearchScoper = (): DataScoper => {
    return ( data) => {
        const getDataAtPath = createPathValueGetter( data );
        const { path } = usePath();

        const exactMatch = getDataAtPath( path );

        if ( exactMatch !== undefined ) {
            return exactMatch;
        }

        // Otherwise find nearest valid parent
        return findDeepestValidPath( path, getDataAtPath ) ?? data;
    }
}

const findDeepestValidPath = ( path: string, getPathValue: ( path: string ) => any ) => {
    const segments = path.split(".");

    // Gradually reduce segments from full → root
    while ( segments.length > 0 ) {
        const candidatePath = segments.join(".");
        const value = getPathValue( candidatePath );

        if ( value !== undefined ) {
            return value;
        }

        segments.pop(); // remove last segment and try parent
    }

    return null;
};


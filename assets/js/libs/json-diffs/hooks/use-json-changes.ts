import { useRef, useMemo } from "@wordpress/element";
import { calculateJsonDiff } from "@libs/json-diffs/calculate-json-diff";
import { useResolvedData } from "@app/context/data/resolved-data-context";
import { eventBus } from "@app/events";
import { usePath } from "@app/context/path-context";

export const useJsonChanges = () => {
    const { data } = useResolvedData();
    const { isSearching } = usePath();
    const previousRef = useRef<unknown>( null );

    const diff = calculateJsonDiff( data, previousRef.current );
    previousRef.current = data;

    if ( isSearching ) {
        return {
            highlighterChanges: []
        }
    }
    // eventBus.on( 'searching', () => {
    //
    // } )

    return diff
    // return useMemo( ()=> {
    //
    // }, [ data ] )
}

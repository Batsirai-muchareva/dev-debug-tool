import { useRef, useMemo } from "@wordpress/element";
import { calculateJsonDiff } from "@libs/json-diffs/calculate-json-diff";
import { useFilteredData } from "@app/context/filter-context";

export const useJsonChanges = () => {
    const { data } = useFilteredData();
    const previousRef = useRef<unknown>( null );

    return useMemo( ()=> {
        const diff = calculateJsonDiff( data, previousRef.current );
        previousRef.current = data;

        return diff
    }, [ data ] )
}

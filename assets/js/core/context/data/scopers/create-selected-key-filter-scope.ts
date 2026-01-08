import { DataScoper } from "@app/context/data/types";
import { useBrowse } from "@app/context/browse-context";

export const createSelectedKeyFilterScope = (): DataScoper => {
    return ( data ) => {
        const rootData = data as Record<string, unknown>;
        const { selectedKey } = useBrowse();

        if ( ! selectedKey ) {
            return data
        }

        return rootData[ selectedKey ];
    }
}

import { MarionetteElement } from "@app/sync/get-selected-element";
import { UnknownData } from "@app/types";

type DataExtractor = {
    extract: ( element: MarionetteElement ) => UnknownData;
}

export const createElementDataExtractor = (
    excludedKeys: string[] = []
): DataExtractor => ( {
    extract: ( element: MarionetteElement ) =>
        element.model.toJSON( { remove: excludedKeys } )
} );

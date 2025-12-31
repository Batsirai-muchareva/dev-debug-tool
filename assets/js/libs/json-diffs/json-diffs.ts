import { JSONChange, JsonObject } from "./types";
import { buildPath } from "@libs/json-diffs/utils/build-path";
import { areDifferent, bothObjects, hasKey, isObject } from "@libs/json-diffs/utils/object-utils";

interface DiffContext {
    newJSON: JsonObject;
    oldJSON: JsonObject;
    path: string;
    changes: JSONChange[];
}

export const jsonDiffs = (
    newJSON: unknown,
    oldJSON: unknown,
    path = ""
): JSONChange[] => {
    const changes: JSONChange[] = [];

    if ( ! isObject( newJSON ) || ! isObject( oldJSON ) ) {
        return changes;
    }

    detectAddedAndModified( { newJSON, oldJSON, path, changes });

    detectRemoved( { newJSON, oldJSON, path, changes, } );

    return changes;
};

const detectAddedAndModified =
    ( { newJSON, oldJSON, path, changes }: DiffContext ) => {

    for ( const key of Object.keys( newJSON ) ) {
        const objPath = buildPath( path, key );

        if ( ! hasKey( oldJSON, key ) ) {
            changes.push( {
                type: "added",
                path: objPath,
                newValue: newJSON[key],
            });
            continue;
        }

        if ( bothObjects( newJSON[key], oldJSON[key] ) ) {
            changes.push(
                ...jsonDiffs(
                    newJSON[key],
                    oldJSON[key],
                    objPath
                )
            );

            continue;
        }

        if ( areDifferent( newJSON[key], oldJSON[key] ) ) {
            changes.push( {
                type: "modified",
                path: objPath,
                oldValue: oldJSON[key],
                newValue: newJSON[key],
            } );
        }
    }
};

const detectRemoved =
    ( { newJSON, oldJSON, path, changes }: DiffContext) => {

    for ( const key of Object.keys( oldJSON ) ) {
        if ( ! hasKey( newJSON, key ) ) {
            changes.push( {
                type: "removed",
                path: buildPath( path, key ),
                oldValue: oldJSON[key],
            } );
        }
    }
};

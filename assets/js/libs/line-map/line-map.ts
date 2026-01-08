import { parseLine } from "./line-parser";
import { createTraversalState } from "@libs/line-map/create-traversal-state";

export interface LineRange {
    start: number;
    end: number;
}

export type LineMap = Record<string, LineRange>;

export function createLineMap() {
    let map: LineMap = {};

    const buildLineMap = ( json: unknown ) => {
        const lines = JSON.stringify( json, null, 2 ).split("\n");
        const state = createTraversalState();

        map = {};

        for ( let i = 0; i < lines.length; i++ ) {
            parseLine( lines[i], state )?.apply( map, i + 1 );
        }
    }

    const pathAtLine = (line: number): string | undefined => {
        let bestMatch: { path: string; range: LineRange } | undefined;
        let smallestRange = Infinity;

        // Step 1: find the most specific path
        for (const [path, range] of Object.entries(map)) {
            if (line >= range.start && line <= range.end) {
                const size = range.end - range.start;
                if (size < smallestRange) {
                    smallestRange = size;
                    bestMatch = { path, range };
                }
            }
        }

        if (!bestMatch) return undefined;

        // Step 2: normalize path if inside `.value` or `$$type` (from bottom)
        const pathParts = bestMatch.path.split(".");

        const valueIndex = pathParts.lastIndexOf("value");
        const typeIndex = pathParts.lastIndexOf("$$type");

        const specialIndex = Math.max(valueIndex, typeIndex);

        if (specialIndex > 0) {
            return pathParts.slice(0, specialIndex).join(".");
        }

        return bestMatch.path;
    };

    const getMaps = () => map;

    return {
        getMaps,
        buildLineMap,
        pathAtLine,
    }
}

export const lineMap = createLineMap();



// const pathAtLine = (line: number): string | undefined => {
//     let bestMatch: { path: string; range: LineRange } | undefined;
//     let smallestRange = Infinity;
//
//     // Step 1: find the most specific path
//     for (const [path, range] of Object.entries(map)) {
//         if (line >= range.start && line <= range.end) {
//             const size = range.end - range.start;
//             if (size < smallestRange) {
//                 smallestRange = size;
//                 bestMatch = { path, range };
//             }
//         }
//     }
//
//     if (!bestMatch) return undefined;
//
//     // Step 2: normalize path if inside `.value` or `$$type`
//     const pathParts = bestMatch.path.split(".");
//     const specialIndex = pathParts.indexOf("value") !== -1
//         ? pathParts.indexOf("value")
//         : pathParts.indexOf("$$type");
//
//     if (specialIndex > 0) {
//         // Return top-level property (before `.value` or `$$type`)
//         return pathParts.slice(0, specialIndex).join(".");
//     }
//
//     // Otherwise return full path
//     return bestMatch.path;
// };

//
// const pathAtLine = ( line: number ) => {
//     for ( const [ path, range ] of Object.entries( map ) ) {
//         if ( line >= range.start && line <= range.end ) {
//             return { path, range };
//         }
//     }
// };

// const pathAtLine = (line: number) => {
//     let bestMatch: { path: string; range: LineRange } | undefined;
//     let smallestRange = Infinity;
//
//     for (const [path, range] of Object.entries(map)) {
//         if (line >= range.start && line <= range.end) {
//             const size = range.end - range.start;
//             if (size < smallestRange) {
//                 smallestRange = size;
//                 bestMatch = { path, range };
//             }
//         }
//     }
//
//     return bestMatch;
// };
// const pathAtLine = (line: number): string | undefined => {
//     let bestMatch: { path: string; range: LineRange } | undefined;
//     let smallestRange = Infinity;
//
//     // Step 1: find the most specific path
//     for (const [path, range] of Object.entries(map)) {
//         if (line >= range.start && line <= range.end) {
//             const size = range.end - range.start;
//             if (size < smallestRange) {
//                 smallestRange = size;
//                 bestMatch = { path, range };
//             }
//         }
//     }
//
//     if (!bestMatch) return undefined;
//
//     // Step 2: normalize path if inside a `value`
//     const pathParts = bestMatch.path.split("."); // e.g., "gap.value.size" -> ["gap","value","size"]
//     const valueIndex = pathParts.indexOf("value");
//
//     if (valueIndex > 0) {
//         // Return the property name before `.value`
//         return pathParts.slice(0, valueIndex).join(".");
//     }
//
//     // Otherwise return full path
//     return bestMatch.path;
// };

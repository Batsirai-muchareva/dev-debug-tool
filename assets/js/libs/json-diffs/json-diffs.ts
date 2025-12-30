type ChangeType = "added" | "removed" | "modified";

export type Changes = {
    type: ChangeType;
    path: string;
    startLine?: number;
    endLine?: number;
    oldValue?: unknown;
    newValue?: unknown;
};

type Value = Record<string, unknown>;

export const getJsonDiff = (
    { newJSON, oldJSON }:
    { newJSON: unknown; oldJSON: unknown; }
) => {
    const lineMap = buildLineMap( newJSON );

    const changes = attachLinesToChanges( jsonDiffs( { newJSON, oldJSON } ), lineMap );

    // Find the change with the biggest interval and scroll to its middle
    let scrollToLine: number | undefined;

    if (changes.length > 0) {
        let maxInterval = -1;
        let targetChange = changes[0];

        for (const change of changes) {
            if (change.startLine !== undefined) {
                const interval = (change.endLine ?? change.startLine) - change.startLine;

                if (interval > maxInterval) {
                    maxInterval = interval;
                    targetChange = change;
                }
            }
        }

        // Scroll to the middle of the range
        if (targetChange.startLine !== undefined) {
            const start = targetChange.startLine;
            const end = targetChange.endLine ?? targetChange.startLine;
            scrollToLine = Math.floor((start + end) / 2);
        }
    }

    return {
        changes,
        scrollToLine: scrollToLine
    };
}
export const jsonDiffs = (
    { newJSON, oldJSON, path = '' }:
    { newJSON: unknown; oldJSON: unknown; path?: string }
) => {
    const changes: Changes[] = [];

    if ( ! isObject( newJSON ) || ! isObject( oldJSON ) ) {
        return changes;
    }

    detectAddedAndModifiedKeys( {
        newJSON,
        oldJSON,
        basePath: path,
        changes
    } );

    detectRemovedKeys( {
        newJSON,
        oldJSON,
        basePath: path,
        changes
    } );

    return changes;
}

// export const attachLinesToChanges = (
//     changes: Changes[],
//     lineMap: Record<string, number>
// ): Changes[] => {
//     return changes.map(change => {
//         const line = lineMap[change.path];
//         if (line) {
//             return {
//                 ...change,
//                 startLine: line,
//                 endLine: line, // single line
//             };
//         }
//         return change;
//     });
// };


// export function buildLineMap(json: unknown): Record<string, number> {
//     const lines = JSON.stringify(json, null, 2).split("\n");
//     const pathStack: (string | number)[] = [];
//     const arrayStack: number[] = [];
//     const map: Record<string, number> = {};
//
//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];
//         const trimmed = line.trim();
//
//         // Calculate current indentation level
//         const indent = line.length - line.trimStart().length;
//         const depth = indent / 2;
//
//         // Check if line ends with array opening
//         const endsWithArrayOpen = trimmed.endsWith("[");
//
//         // Object key
//         const keyMatch = line.match(/^(\s*)"([^"]+)":/);
//         if (keyMatch) {
//             // The depth represents nesting level
//             // For root keys (indent=2, depth=1), we want pathStack to be empty before pushing
//             // So we trim to depth - 1
//             pathStack.length = Math.max(0, depth - 1);
//
//             pathStack.push(keyMatch[2]);
//
//             const path = pathStack.join(".");
//             map[path] = i + 1;
//
//             // If this line also opens an array, track it
//             if (endsWithArrayOpen) {
//                 arrayStack.push(-1);
//             }
//             continue;
//         }
//
//         // Standalone array close ]
//         if (trimmed === "]") {
//             arrayStack.pop();
//             // Remove the array index from pathStack if present
//             if (pathStack.length > 0 && typeof pathStack[pathStack.length - 1] === 'number') {
//                 pathStack.pop();
//             }
//             continue;
//         }
//
//         // Object opening inside array
//         if (trimmed === "{" && arrayStack.length > 0) {
//             const currentArrayIndex = arrayStack.length - 1;
//             arrayStack[currentArrayIndex]++;
//
//             // Push the array index at the current depth
//             pathStack.length = Math.max(0, depth - 1);
//             pathStack.push(arrayStack[currentArrayIndex]);
//
//             const path = pathStack.join(".");
//             map[path] = i + 1;
//             continue;
//         }
//
//         // Object close }
//         if (trimmed === "}") {
//             // If last item in pathStack is a number (array index), pop it
//             if (pathStack.length > 0 && typeof pathStack[pathStack.length - 1] === 'number') {
//                 pathStack.pop();
//             }
//             continue;
//         }
//
//         // Primitive value inside array
//         if (arrayStack.length > 0 && !trimmed.startsWith("{") && !trimmed.startsWith("}") && trimmed !== "]") {
//             const currentArrayIndex = arrayStack.length - 1;
//             arrayStack[currentArrayIndex]++;
//
//             pathStack.length = Math.max(0, depth - 1);
//             pathStack.push(arrayStack[currentArrayIndex]);
//
//             const path = pathStack.join(".");
//             map[path] = i + 1;
//
//             pathStack.pop();
//             continue;
//         }
//     }
//
//     return map;
// }
// export function buildLineMap(json: unknown): Record<string, { start: number; end: number }> {
//     const lines = JSON.stringify(json, null, 2).split("\n");
//     const pathStack: (string | number)[] = [];
//     const arrayStack: number[] = [];
//     const map: Record<string, { start: number; end: number }> = {};
//
//     // Stack to track opening positions for objects/arrays
//     const openStack: { path: string; line: number }[] = [];
//
//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];
//         const trimmed = line.trim();
//
//         // Calculate current indentation level
//         const indent = line.length - line.trimStart().length;
//         const depth = indent / 2;
//
//         // Check if line ends with array or object opening
//         const endsWithArrayOpen = trimmed.endsWith("[");
//         const endsWithObjectOpen = trimmed.endsWith("{");
//
//         // Object key
//         const keyMatch = line.match(/^(\s*)"([^"]+)":/);
//         if (keyMatch) {
//             pathStack.length = Math.max(0, depth - 1);
//             pathStack.push(keyMatch[2]);
//
//             const path = pathStack.join(".");
//             map[path] = { start: i + 1, end: i + 1 }; // Will update end later if needed
//
//             // If this opens an object or array, track it
//             if (endsWithArrayOpen) {
//                 arrayStack.push(-1);
//                 openStack.push({ path, line: i + 1 });
//             } else if (endsWithObjectOpen) {
//                 openStack.push({ path, line: i + 1 });
//             }
//             continue;
//         }
//
//         // Standalone array close ]
//         if (trimmed === "]") {
//             // Update the end line for the array that's closing
//             if (openStack.length > 0) {
//                 const opening = openStack.pop()!;
//                 if (map[opening.path]) {
//                     map[opening.path].end = i + 1;
//                 }
//             }
//
//             arrayStack.pop();
//             if (pathStack.length > 0 && typeof pathStack[pathStack.length - 1] === 'number') {
//                 pathStack.pop();
//             }
//             continue;
//         }
//
//         // Object opening inside array
//         if (trimmed === "{" && arrayStack.length > 0) {
//             const currentArrayIndex = arrayStack.length - 1;
//             arrayStack[currentArrayIndex]++;
//
//             pathStack.length = Math.max(0, depth - 1);
//             pathStack.push(arrayStack[currentArrayIndex]);
//
//             const path = pathStack.join(".");
//             map[path] = { start: i + 1, end: i + 1 };
//             openStack.push({ path, line: i + 1 });
//             continue;
//         }
//
//         // Object close }
//         if (trimmed === "}") {
//             // Update the end line for the object that's closing
//             if (openStack.length > 0) {
//                 const opening = openStack.pop()!;
//                 if (map[opening.path]) {
//                     map[opening.path].end = i + 1;
//                 }
//             }
//
//             if (pathStack.length > 0 && typeof pathStack[pathStack.length - 1] === 'number') {
//                 pathStack.pop();
//             }
//             continue;
//         }
//
//         // Primitive value inside array
//         if (arrayStack.length > 0 && !trimmed.startsWith("{") && !trimmed.startsWith("}") && trimmed !== "]") {
//             const currentArrayIndex = arrayStack.length - 1;
//             arrayStack[currentArrayIndex]++;
//
//             pathStack.length = Math.max(0, depth - 1);
//             pathStack.push(arrayStack[currentArrayIndex]);
//
//             const path = pathStack.join(".");
//             map[path] = { start: i + 1, end: i + 1 };
//
//             pathStack.pop();
//             continue;
//         }
//     }
//
//     return map;
// }
export function buildLineMap(json: unknown): Record<string, { start: number; end: number }> {
    const lines = JSON.stringify(json, null, 2).split("\n");
    const pathStack: (string | number)[] = [];
    const arrayStack: number[] = [];
    const map: Record<string, { start: number; end: number }> = {};

    // Stack to track opening positions with their indent level
    const openStack: { path: string; line: number; indent: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Calculate current indentation level
        const indent = line.length - line.trimStart().length;
        const depth = indent / 2;

        // Check if line ends with array or object opening
        const endsWithArrayOpen = trimmed.endsWith("[");
        const endsWithObjectOpen = trimmed.endsWith("{");

        // Object key
        const keyMatch = line.match(/^(\s*)"([^"]+)":/);
        if (keyMatch) {
            pathStack.length = Math.max(0, depth - 1);
            pathStack.push(keyMatch[2]);

            const path = pathStack.join(".");
            map[path] = { start: i + 1, end: i + 1 };

            // If this opens an object or array, track it with indent
            if (endsWithArrayOpen) {
                arrayStack.push(-1);
                openStack.push({ path, line: i + 1, indent });
            } else if (endsWithObjectOpen) {
                openStack.push({ path, line: i + 1, indent });
            }
            continue;
        }

        // Standalone array close ]
        if (trimmed === "]") {
            // Find the matching opening bracket by indent
            for (let j = openStack.length - 1; j >= 0; j--) {
                if (openStack[j].indent === indent) {
                    const opening = openStack.splice(j, 1)[0];
                    if (map[opening.path]) {
                        map[opening.path].end = i + 1;
                    }
                    break;
                }
            }

            arrayStack.pop();
            if (pathStack.length > 0 && typeof pathStack[pathStack.length - 1] === 'number') {
                pathStack.pop();
            }
            continue;
        }

        // Object opening inside array
        if (trimmed === "{" && arrayStack.length > 0) {
            const currentArrayIndex = arrayStack.length - 1;
            arrayStack[currentArrayIndex]++;

            pathStack.length = Math.max(0, depth - 1);
            pathStack.push(arrayStack[currentArrayIndex]);

            const path = pathStack.join(".");
            map[path] = { start: i + 1, end: i + 1 };
            openStack.push({ path, line: i + 1, indent });
            continue;
        }

        // Object close }
        if (trimmed === "}") {
            // Find the matching opening brace by indent
            for (let j = openStack.length - 1; j >= 0; j--) {
                if (openStack[j].indent === indent) {
                    const opening = openStack.splice(j, 1)[0];
                    if (map[opening.path]) {
                        map[opening.path].end = i + 1;
                    }
                    break;
                }
            }

            if (pathStack.length > 0 && typeof pathStack[pathStack.length - 1] === 'number') {
                pathStack.pop();
            }
            continue;
        }

        // Primitive value inside array
        if (arrayStack.length > 0 && !trimmed.startsWith("{") && !trimmed.startsWith("}") && trimmed !== "]") {
            const currentArrayIndex = arrayStack.length - 1;
            arrayStack[currentArrayIndex]++;

            pathStack.length = Math.max(0, depth - 1);
            pathStack.push(arrayStack[currentArrayIndex]);

            const path = pathStack.join(".");
            map[path] = { start: i + 1, end: i + 1 };

            pathStack.pop();
            continue;
        }
    }

    return map;
}
export const attachLinesToChanges = (
    changes: Changes[],
    lineMap: Record<string, { start: number; end: number }>
): Changes[] => {
    return changes.map(change => {
        const lineInfo = lineMap[change.path];
        if (lineInfo) {
            return {
                ...change,
                startLine: lineInfo.start,
                endLine: lineInfo.end,
            };
        }
        return change;
    });
};

const detectAddedAndModifiedKeys = (
    { newJSON, oldJSON, basePath, changes }:
    { newJSON: unknown, oldJSON: unknown, basePath: string, changes: Changes[] }
) => {
    for ( const key of Object.keys( newJSON as Value ) ) {
        const path = buildPath( { basePath, key } );
        const oldValue = oldJSON as Value;
        const newValue = newJSON as Value;

        if ( ! keyExists( oldValue, key ) ) {
            recordAddedChange( {
                changes,
                path,
                newValue: newValue[ key ],
            } );

            continue;
        }

        if ( bothAreObjects( newValue[ key ], oldValue[key] ) ) {
            changes.push(
                ...jsonDiffs( {
                    oldJSON: oldValue[ key ],
                    newJSON: newValue[ key ],
                    path
                } )
            );

            continue;
        }

        if ( valuesAreDifferent( newValue[key], oldValue[key] ) ) {
            recordModifiedChange( {
                changes,
                path,
                newValue: newValue[key],
                oldValue: oldValue[key]
            } );
        }
    }
}

const recordRemovedChange = (
    { changes, path, oldValue }:
    { changes: Changes[], path: string, oldValue: unknown }
) => {
    changes.push( {
        type: "removed",
        path,
        oldValue,
    } );
}

const recordAddedChange =
    (
        { changes, newValue, path }:
        { changes: Changes[], path: string, newValue: unknown }
    ) => {

    changes.push( {
        type: 'added',
        path,
        newValue,
    } );
}

const valuesAreDifferent = ( a: unknown, b: unknown ) => {
    return a !== b;
}

const recordModifiedChange = (
    { changes, path, newValue, oldValue }:
    { changes: Changes[], path: string, newValue: unknown, oldValue: unknown }
) => {

    changes.push({
        type: "modified",
        path,
        oldValue,
        newValue,
    });
}

const detectRemovedKeys = (
    { newJSON, oldJSON, basePath, changes }:
    { newJSON: unknown, oldJSON: unknown, basePath: string, changes: Changes[] }
) => {
    for (const key of Object.keys( oldJSON as Record<string, unknown> ) ) {
        if ( ! keyExists( newJSON, key ) ) {
            const path = buildPath( { basePath, key } );
            recordRemovedChange( {
                changes,
                path,
                oldValue: ( oldJSON as Record<string, unknown>)[key],
            } );
        }
    }
}

const buildPath = (
    { basePath, key }:
    { basePath: string, key: string }
) => {
    return basePath ? `${ basePath }.${key}` : key;
}

const keyExists = ( value: unknown, key: string ) => {
    return (
        typeof value === "object" &&
        value !== null &&
        Object.prototype.hasOwnProperty.call(value, key)
    );
}

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const bothAreObjects = (
    newValue: unknown,
    oldValue: unknown
) => {
    return (
        typeof newValue === "object" &&
        typeof oldValue === "object" &&
        newValue !== null &&
        oldValue !== null
    );
}

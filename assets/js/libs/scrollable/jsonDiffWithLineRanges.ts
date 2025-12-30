// export type ChangeType = "added" | "removed" | "modified";
//
// export interface JSONChange {
//     type: ChangeType;
//     path: string;
//     startLine: number;
//     endLine: number;
//     oldValue?: unknown;
//     newValue?: unknown;
// }
//
// interface DiffContext {
//     path: string;
//     line: number;
//     changes: JSONChange[];
// }
//
// /* -------------------------------------------------------------------------- */
// /*                                PUBLIC API                                  */
// /* -------------------------------------------------------------------------- */
//
// export function diffJSONWithLineRanges(
//     oldJSON: unknown,
//     newJSON: unknown
// ): JSONChange[] {
//     const ctx: DiffContext = {
//         path: "",
//         line: 0,
//         changes: [],
//     };
//
//     walk(oldJSON, newJSON, ctx);
//     return ctx.changes;
// }
//
// /* -------------------------------------------------------------------------- */
// /*                                   WALKER                                   */
// /* -------------------------------------------------------------------------- */
//
// function walk(
//     oldNode: unknown,
//     newNode: unknown,
//     ctx: DiffContext
// ): { startLine: number; endLine: number } {
//     const startLine = ++ctx.line;
//
//     // Primitive value
//     if (!isObject(newNode)) {
//         const endLine = ctx.line;
//
//         if (oldNode !== newNode) {
//             ctx.changes.push({
//                 type: oldNode === undefined ? "added" : "modified",
//                 path: ctx.path,
//                 startLine,
//                 endLine,
//                 oldValue: oldNode,
//                 newValue: newNode,
//             });
//         }
//
//         return { startLine, endLine };
//     }
//
//     // Opening brace
//     ctx.line++;
//
//     const oldObject = isObject(oldNode) ? oldNode : {};
//     const oldKeys = Object.keys(oldObject);
//     const newKeys = Object.keys(newNode);
//     const visited = new Set<string>();
//
//     for (const key of newKeys) {
//         visited.add(key);
//
//         const childPath = ctx.path ? `${ctx.path}.${key}` : key;
//
//         // Key line
//         ctx.line++;
//
//         walk(
//             (oldObject as Record<string, unknown>)[key],
//             (newNode as Record<string, unknown>)[key],
//             {
//                 ...ctx,
//                 path: childPath,
//             }
//         );
//     }
//
//     // Removed keys
//     for (const key of oldKeys) {
//         if (!visited.has(key)) {
//             const removedPath = ctx.path ? `${ctx.path}.${key}` : key;
//
//             ctx.changes.push({
//                 type: "removed",
//                 path: removedPath,
//                 startLine: ctx.line,
//                 endLine: ctx.line,
//                 oldValue: (oldObject as Record<string, unknown>)[key],
//             });
//         }
//     }
//
//     // Closing brace
//     const endLine = ++ctx.line;
//
//     // Entire object modified
//     if (isObject(oldNode) && oldNode !== newNode) {
//         ctx.changes.push({
//             type: "modified",
//             path: ctx.path,
//             startLine,
//             endLine,
//             oldValue: oldNode,
//             newValue: newNode,
//         });
//     }
//
//     return { startLine, endLine };
// }
//
// /* -------------------------------------------------------------------------- */
// /*                                  HELPERS                                   */
// /* -------------------------------------------------------------------------- */
//
// function isObject(value: unknown): value is Record<string, unknown> {
//     return typeof value === "object" && value !== null;
// }



/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ChangeType = "added" | "removed" | "modified";

export interface JSONChange {
    type: ChangeType;
    path: string;
    startLine: number;
    endLine: number;
    oldValue?: unknown;
    newValue?: unknown;
}

interface DiffContext {
    path: string;
    line: number;
    allChanges: JSONChange[];
}

/* -------------------------------------------------------------------------- */
/*                               PUBLIC API                                   */
/* -------------------------------------------------------------------------- */

/**
 * Computes JSON diff with line ranges.
 * If number of changes exceeds maxHighlights, returns an empty array.
 */
export function diffJSONWithLineRanges(
    oldJSON: unknown,
    newJSON: unknown,
    maxHighlights = 5
): JSONChange[] {
    const ctx: DiffContext = {
        path: "",
        line: 0,
        allChanges: [],
    };

    walk(oldJSON, newJSON, ctx);

    // UX RULE: Too many changes → no highlights
    if (ctx.allChanges.length > maxHighlights) {
        return [];
    }

    return ctx.allChanges;
}

/* -------------------------------------------------------------------------- */
/*                                   WALKER                                   */
/* -------------------------------------------------------------------------- */


function walk(
    oldNode: unknown,
    newNode: unknown,
    ctx: DiffContext
): { startLine: number; endLine: number } {
    const startLine = ++ctx.line;

    // -------------------- Primitive value --------------------
    if (!isObject(newNode)) {
        const endLine = ctx.line;

        if (oldNode !== newNode) {
            ctx.allChanges.push({
                type: oldNode === undefined ? "added" : "modified",
                path: ctx.path,
                startLine,
                endLine,
                oldValue: oldNode,
                newValue: newNode,
            });
        }

        return { startLine, endLine };
    }

    // -------------------- Object start --------------------
    ctx.line++; // opening brace

    const oldObject = isObject(oldNode) ? oldNode : {};
    const oldKeys = Object.keys(oldObject);
    const newKeys = Object.keys(newNode);
    const visited = new Set<string>();

    // Added / Modified / Nested
    for (const key of newKeys) {
        visited.add(key);

        const childPath = ctx.path ? `${ctx.path}.${key}` : key;

        ctx.line++; // key line

        walk(
            (oldObject as Record<string, unknown>)[key],
            (newNode as Record<string, unknown>)[key],
            {
                ...ctx,
                path: childPath,
            }
        );
    }

    // Removed
    for (const key of oldKeys) {
        if (!visited.has(key)) {
            const removedPath = ctx.path ? `${ctx.path}.${key}` : key;

            ctx.allChanges.push({
                type: "removed",
                path: removedPath,
                startLine: ctx.line,
                endLine: ctx.line,
                oldValue: (oldObject as Record<string, unknown>)[key],
            });
        }
    }

    // -------------------- Object end --------------------
    const endLine = ++ctx.line;

    return { startLine, endLine };
}


// function walk(
//     oldNode: unknown,
//     newNode: unknown,
//     ctx: DiffContext
// ): { startLine: number; endLine: number } {
//     const startLine = ++ctx.line;
//
//     // -------------------- Primitive value --------------------
//     if (!isObject(newNode)) {
//         const endLine = ctx.line;
//
//         if (oldNode !== newNode) {
//             ctx.allChanges.push({
//                 type: oldNode === undefined ? "added" : "modified",
//                 path: ctx.path,
//                 startLine,
//                 endLine,
//                 oldValue: oldNode,
//                 newValue: newNode,
//             });
//         }
//
//         return { startLine, endLine };
//     }
//
//     // -------------------- Object start --------------------
//     ctx.line++; // opening brace
//
//     const oldObject = isObject(oldNode) ? oldNode : {};
//     const oldKeys = Object.keys(oldObject);
//     const newKeys = Object.keys(newNode);
//     const visited = new Set<string>();
//
//     // Added / Modified / Nested
//     for (const key of newKeys) {
//         visited.add(key);
//
//         const childPath = ctx.path ? `${ctx.path}.${key}` : key;
//
//         ctx.line++; // key line
//
//         walk(
//             (oldObject as Record<string, unknown>)[key],
//             (newNode as Record<string, unknown>)[key],
//             {
//                 ...ctx,
//                 path: childPath,
//             }
//         );
//     }
//
//     // Removed
//     for (const key of oldKeys) {
//         if (!visited.has(key)) {
//             const removedPath = ctx.path ? `${ctx.path}.${key}` : key;
//
//             ctx.allChanges.push({
//                 type: "removed",
//                 path: removedPath,
//                 startLine: ctx.line,
//                 endLine: ctx.line,
//                 oldValue: (oldObject as Record<string, unknown>)[key],
//             });
//         }
//     }
//
//     // -------------------- Object end --------------------
//     const endLine = ++ctx.line;
//
//     // Entire object modified (structural change)
//     if (isObject(oldNode) && oldNode !== newNode) {
//         ctx.allChanges.push({
//             type: "modified",
//             path: ctx.path,
//             startLine,
//             endLine,
//             oldValue: oldNode,
//             newValue: newNode,
//         });
//     }
//
//     return { startLine, endLine };
// }

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

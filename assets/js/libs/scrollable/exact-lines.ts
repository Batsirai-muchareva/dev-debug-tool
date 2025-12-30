// // -----------------------------
// // Types
// // -----------------------------
//
// export type DiffType = "added" | "removed" | "modified";
//
// export interface DiffChange {
//     type: DiffType;
//     path: string;
//     oldValue?: unknown;
//     newValue?: unknown;
//     startLine: number;
//     endLine: number;
// }
//
// // -----------------------------
// // Helpers
// // -----------------------------
//
// function isPlainObject(value: unknown): value is Record<string, unknown> {
//     return (
//         typeof value === "object" &&
//         value !== null &&
//         !Array.isArray(value)
//     );
// }
//
// function isPrimitive(value: unknown): boolean {
//     return (
//         value === null ||
//         typeof value !== "object"
//     );
// }
//
// function arraysEqual(a: unknown[], b: unknown[]): boolean {
//     if (a.length !== b.length) return false;
//     return a.every((v, i) => JSON.stringify(v) === JSON.stringify(b[i]));
// }
//
// // -----------------------------
// // 1️⃣ Leaf-only diff (arrays handled correctly)
// // -----------------------------
//
// function diffJSON(
//     oldVal: unknown,
//     newVal: unknown,
//     path = ""
// ): Omit<DiffChange, "startLine" | "endLine">[] {
//     const changes: Omit<DiffChange, "startLine" | "endLine">[] = [];
//
//     // -------- Primitive --------
//     if (isPrimitive(oldVal) || isPrimitive(newVal)) {
//         if (oldVal !== newVal) {
//             changes.push({
//                 type: oldVal === undefined ? "added" : "modified",
//                 path,
//                 oldValue: oldVal,
//                 newValue: newVal,
//             });
//         }
//         return changes;
//     }
//
//     // -------- Arrays --------
//     if (Array.isArray(oldVal) && Array.isArray(newVal)) {
//         if (!arraysEqual(oldVal, newVal)) {
//             changes.push({
//                 type: "modified",
//                 path,
//                 oldValue: oldVal,
//                 newValue: newVal,
//             });
//         }
//         return changes;
//     }
//
//     // -------- Objects --------
//     if (isPlainObject(oldVal) && isPlainObject(newVal)) {
//         const oldKeys = Object.keys(oldVal);
//         const newKeys = Object.keys(newVal);
//         const visited = new Set<string>();
//
//         for (const key of newKeys) {
//             visited.add(key);
//             const nextPath = path ? `${path}.${key}` : key;
//
//             if (!(key in oldVal)) {
//                 changes.push({
//                     type: "added",
//                     path: nextPath,
//                     newValue: newVal[key],
//                 });
//             } else {
//                 changes.push(
//                     ...diffJSON(oldVal[key], newVal[key], nextPath)
//                 );
//             }
//         }
//
//         for (const key of oldKeys) {
//             if (!visited.has(key)) {
//                 const nextPath = path ? `${path}.${key}` : key;
//                 changes.push({
//                     type: "removed",
//                     path: nextPath,
//                     oldValue: oldVal[key],
//                 });
//             }
//         }
//     }
//
//     return changes;
// }
//
// // -----------------------------
// // 2️⃣ Build line map from JSON.stringify
// // -----------------------------
//
// function buildLineMapFromJSONStringify(
//     json: unknown
// ): Record<string, number> {
//     const lines = JSON.stringify(json, null, 2).split("\n");
//     const pathStack: string[] = [];
//     const map: Record<string, number> = {};
//
//     lines.forEach((line, index) => {
//         const match = line.match(/^(\s*)"([^"]+)":/);
//         if (!match) return;
//
//         const indent = match[1].length;
//         const key = match[2];
//         const depth = indent / 2;
//
//         pathStack.length = depth;
//         pathStack.push(key);
//
//         map[pathStack.join(".")] = index + 1;
//     });
//
//     return map;
// }
//
// // -----------------------------
// // 3️⃣ Final API (NO FALLBACK LINES)
// // -----------------------------
//
// export function diffJSONWithExactLines( { oldJSON, newJSON }: { oldJSON: unknown; newJSON: unknown } ): DiffChange[] {
//     const maxHighlights = 5;
//     const rawChanges = diffJSON( oldJSON, newJSON );
//
//     if ( rawChanges.length > maxHighlights ) {
//         return [];
//     }
//
//     const lineMap = buildLineMapFromJSONStringify( newJSON );
//
//     return rawChanges
//         .map( change  => {
//             const line = lineMap[ change.path ];
//             // if ( ! line ) {
//             //     return null;
//             // } // 🔥 DO NOT FALL BACK
//
//             return {
//                 ...change,
//                 startLine: line,
//                 endLine: line,
//             };
//         })
//         .filter(Boolean) as DiffChange[];
// }


// -----------------------------
// Types
// -----------------------------

export type DiffType = "added" | "removed" | "modified";

export interface DiffChange {
    type: DiffType;
    path: string;
    oldValue?: unknown;
    newValue?: unknown;
    startLine: number;
    endLine: number;
}

// -----------------------------
// Helpers
// -----------------------------

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPrimitive(v: unknown): boolean {
    return v === null || typeof v !== "object";
}

// -----------------------------
// 1️⃣ Leaf-only diff (STRICT)
// -----------------------------

export function diffJSON(
    oldVal: unknown,
    newVal: unknown,
    path = ""
): Omit<DiffChange, "startLine" | "endLine">[] {
    const changes: Omit<DiffChange, "startLine" | "endLine">[] = [];

    // ---- Ignore root primitive ----
    if (path === "" && isPrimitive(oldVal) && isPrimitive(newVal)) {
        return changes;
    }

    // ---- Primitive change ----
    if (isPrimitive(oldVal) && isPrimitive(newVal)) {
        if (oldVal !== newVal) {
            changes.push({
                type: "modified",
                path,
                oldValue: oldVal,
                newValue: newVal,
            });
        }
        return changes;
    }

    // ---- Objects ----
    if (isPlainObject(oldVal) && isPlainObject(newVal)) {
        const oldKeys = Object.keys(oldVal);
        const newKeys = Object.keys(newVal);
        const seen = new Set<string>();

        for (const key of newKeys) {
            seen.add(key);
            const nextPath = path ? `${path}.${key}` : key;

            if (!(key in oldVal)) {
                changes.push({
                    type: "added",
                    path: nextPath,
                    newValue: newVal[key],
                });
            } else {
                changes.push(
                    ...diffJSON(oldVal[key], newVal[key], nextPath)
                );
            }
        }

        for (const key of oldKeys) {
            if (!seen.has(key)) {
                const nextPath = path ? `${path}.${key}` : key;
                changes.push({
                    type: "removed",
                    path: nextPath,
                    oldValue: oldVal[key],
                });
            }
        }
    }

    return changes;
}

// -----------------------------
// 2️⃣ Line map from JSON.stringify
// -----------------------------
export function buildLineMapFromJSONStringify(
    json: unknown
): Record<string, number> {
    const lines = JSON.stringify(json, null, 2).split("\n");

    const pathStack: string[] = [];
    const map: Record<string, number> = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // ---------- Object key ----------
        const keyMatch = line.match(/^(\s*)"([^"]+)":/);
        if (keyMatch) {
            const indent = keyMatch[1].length;
            const key = keyMatch[2];
            const depth = indent / 2;

            pathStack.length = depth;
            pathStack.push(key);

            const path = pathStack.filter(Boolean).join(".");
            map[path] = i + 1;
            continue;
        }

        // ---------- Array open ----------
        if (line.trim() === "[") {
            const indent = line.search(/\S/);
            const depth = indent / 2;

            pathStack.length = depth;

            // 👇 only push array marker if not root
            if (pathStack.length > 0) {
                pathStack.push("");
            }
            continue;
        }

        // ---------- Array close ----------
        if (line.trim() === "]") {
            if (pathStack[pathStack.length - 1] === "") {
                pathStack.pop();
            }
        }
    }

    return map;
}

// export function buildLineMapFromJSONStringify(
//     json: unknown
// ): Record<string, number> {
//     const lines = JSON.stringify(json, null, 2).split("\n");
//
//     // Each entry:
//     // - string → object key
//     // - ""     → array depth marker
//     const pathStack: string[] = [];
//     const map: Record<string, number> = {};
//
//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];
//
//         // ---------- Object key ----------
//         const keyMatch = line.match(/^(\s*)"([^"]+)":/);
//         if (keyMatch) {
//             const indent = keyMatch[1].length;
//             const key = keyMatch[2];
//             const depth = indent / 2;
//
//             pathStack.length = depth;
//             pathStack.push(key);
//
//             map[pathStack.join(".")] = i + 1;
//             continue;
//         }
//
//         // ---------- Array open ----------
//         if (line.trim() === "[") {
//             const indent = line.search(/\S/);
//             const depth = indent / 2;
//
//             pathStack.length = depth;
//             pathStack.push(""); // 👈 array marker
//             continue;
//         }
//
//         // ---------- Array close ----------
//         if (line.trim() === "]") {
//             pathStack.pop();
//         }
//     }
//
//     return map;
// }

// export function buildLineMapFromJSONStringify(
//     json: unknown
// ): Record<string, number> {
//     const lines = JSON.stringify(json, null, 2).split("\n");
//     const pathStack: string[] = [];
//     const map: Record<string, number> = {};
//
//     lines.forEach((line, index) => {
//         const match = line.match(/^(\s*)"([^"]+)":/);
//         if (!match) return;
//
//         const indent = match[1].length;
//         const key = match[2];
//         const depth = indent / 2;
//
//         pathStack.length = depth;
//         pathStack.push(key);
//
//         map[pathStack.join(".")] = index + 1;
//     });
//
//     return map;
// }

// -----------------------------
// 3️⃣ Final API (SAFE, NO WIPEOUT)
// -----------------------------

// export function diffJSONWithExactLines(
//     oldJSON: unknown,
//     newJSON: unknown,
//     maxHighlights = 5
// ): DiffChange[] {
export function diffJSONWithExactLines( { oldJSON, newJSON }: { oldJSON: unknown; newJSON: unknown } ): DiffChange[] {
    const maxHighlights = 5;

    const raw = diffJSON(oldJSON, newJSON);

    if (raw.length === 0) return [];
    if (raw.length > maxHighlights) return [];

    const lineMap = buildLineMapFromJSONStringify(newJSON);

    const result: DiffChange[] = [];

    for ( const change of raw ) {
        const line = lineMap[change.path];

        if ( ! line ) {
            // only skip THIS change
            continue;
        }

        result.push( {
            ...change,
            startLine: line,
            endLine: line,
        } );
    }

    return result;
}

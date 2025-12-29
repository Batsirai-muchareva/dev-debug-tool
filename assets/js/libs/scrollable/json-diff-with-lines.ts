export type ChangeType = "added" | "removed" | "modified";

export interface JSONChange {
    type: ChangeType;
    path: string;
    line: number;
    oldValue?: unknown;
    newValue?: unknown;
}

interface DiffContext {
    path: string;
    line: number;
    changes: JSONChange[];
}

/* -------------------------------------------------------------------------- */
/*                               PUBLIC API                                   */
/* -------------------------------------------------------------------------- */

/**
 * Computes JSON diff with line numbers in ONE traversal.
 */
export function diffJSONWithLineNumbers( oldJSON: unknown, newJSON: unknown ): JSONChange[] {
    const context: DiffContext = {
        path: "",
        line: 0,
        changes: [],
    };

    walk( oldJSON, newJSON, context );

    return context.changes;
}

function walk( oldNode: unknown, newNode: unknown, ctx: DiffContext ): void {
    // Each node corresponds to a rendered line
    ctx.line++;

    // Primitive value
    if ( ! isObject( newNode ) ) {
        if ( oldNode !== newNode ) {
            ctx.changes.push( {
                type: oldNode === undefined ? "added" : "modified",
                path: ctx.path,
                line: ctx.line,
                oldValue: oldNode,
                newValue: newNode,
            } );
        }
        return;
    }

    // Object opening brace
    ctx.line++;

    const oldObject = isObject( oldNode ) ? oldNode : {};
    const oldKeys = Object.keys( oldObject );
    const newKeys = Object.keys( newNode );
    const visited = new Set<string>();

    // Added + Modified + Nested
    for ( const key of newKeys ) {
        visited.add( key );

        const nextPath = ctx.path ? `${ctx.path}.${key}` : key;

        // Key line
        ctx.line++;

        walk(
            ( oldObject as Record<string, unknown> )[key],
            ( newNode as Record<string, unknown> )[key],
            {
                ...ctx,
                path: nextPath,
            }
        );
    }

    // Removed
    for ( const key of oldKeys ) {
        if ( ! visited.has( key ) ) {
            const removedPath = ctx.path ? `${ctx.path}.${key}` : key;

            ctx.changes.push( {
                type: "removed",
                path: removedPath,
                line: ctx.line,
                oldValue: (oldObject as Record<string, unknown>)[key],
            } );
        }
    }

    // Object closing brace
    ctx.line++;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

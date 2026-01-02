import { LineMap } from "@libs/json-diffs/line-mapper";
import { ParsedLine, TraversalState } from "@libs/json-diffs/types";
import {
    closeBlock,
    enterArrayElement,
    enterKey, exitArrayElement,
    isInsideArray,
    openBlock
} from "@libs/line-map/create-traversal-state";

const isPrimitive = ( value: string) =>
    !value.startsWith("{") && !value.startsWith("}") && value !== "]" && value !== "],";

export function parseLine(line: string, state: TraversalState): ParsedLine | null {
    const trimmed = line.trim();
    const indent = line.length - line.trimStart().length;
    const depth = indent / 2;

    const keyMatch = line.match(/^(\s*)"([^"]+)":/);

    if ( keyMatch ) {
        return {
            apply( map: LineMap, lineNo: number ) {
                const path = enterKey( state, keyMatch[2], depth );
                map[path] = { start: lineNo, end: lineNo };

                if ( trimmed.endsWith( "{" ) ) {
                    openBlock( state, path, indent, false );
                } else if ( trimmed.endsWith("[") ) {
                    openBlock( state, path, indent, true );
                }
            },
        };
    }

    // ─── Standalone ] ───────────────────────────
    if ( trimmed === "]" || trimmed === "]," ) {
        return {
            apply(map: LineMap, lineNo: number) {
                const path = closeBlock(state, indent);
                if (path) map[path].end = lineNo;
            },
        };
    }

    // ─── { inside array ─────────────────────────
    if ( trimmed === "{" && isInsideArray( state ) ) {
        return {
            apply( map: LineMap, lineNo: number ) {
                const path = enterArrayElement(state, depth);
                map[path] = { start: lineNo, end: lineNo };
                openBlock(state, path, indent, false);
            },
        };
    }

    // ─── Object close } ─────────────────────────
    if (trimmed === "}" || trimmed === "},") {
        return {
            apply(map: LineMap, lineNo: number) {
                const path = closeBlock(state, indent);
                if (path) map[path].end = lineNo;
            },
        };
    }

    // ─── Primitive inside array ─────────────────
    if ( isInsideArray(state) && isPrimitive(trimmed) ) {
        return {
            apply(map: LineMap, lineNo: number) {
                const path = enterArrayElement(state, depth);
                map[path] = { start: lineNo, end: lineNo };
                exitArrayElement(state);
            },
        };
    }

    return null;
}

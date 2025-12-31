import { parseLine } from "./line-parser";
import { createTraversalState } from "@libs/json-diffs/line-map/create-traversal-state";

export interface LineRange {
    start: number;
    end: number;
}

export type LineMap = Record<string, LineRange>;

export function buildLineMap(json: unknown): LineMap {
    const lines = JSON.stringify(json, null, 2).split("\n");
    const map: LineMap = {};
    const state = createTraversalState();

    for ( let i = 0; i < lines.length; i++ ) {
        parseLine( lines[i], state )?.apply( map, i + 1 );
    }

    return map;
}

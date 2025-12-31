import { JSONChange, LineChanges } from "./types";

export interface LineRange {
    start: number;
    end: number;
}

export type LineMap = Record<string, LineRange>;

export const attachLinesToChanges = (
    changes: JSONChange[],
    lineMap: LineMap
): LineChanges[] =>
    changes
        .filter(change => lineMap[ change.path ] !== undefined)
        .map( change  => {
            const range = lineMap[change.path]!;

            return {
                startLine: range.start,
                endLine: range.end,
            };
        } );

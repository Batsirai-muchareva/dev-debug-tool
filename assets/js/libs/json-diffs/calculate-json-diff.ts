import { DiffResult } from "@libs/json-diffs/types";
import { jsonDiffs } from "@libs/json-diffs/json-diffs";
import { attachLinesToChanges } from "@libs/json-diffs/line-mapper";
import { buildLineMap } from "@libs/json-diffs/line-map/build-line-map";

export const calculateJsonDiff = (
    newJSON: unknown,
    oldJSON: unknown
): DiffResult => {
    const changesWithPaths = jsonDiffs( newJSON, oldJSON );

    if ( changesWithPaths.length > 3 ) {
        return {
            highlighterChanges: [],
        };
    }

    const lineMap = buildLineMap( newJSON );
    const lineChanges = attachLinesToChanges( changesWithPaths, lineMap );

    const highlighterChanges = lineChanges.flatMap( change => {
        const start = change.startLine;
        const end = change.endLine ?? start;

        const lines: number[] = [];

        for ( let line = start; line <= end; line++ ) {
            lines.push(line);
        }
        return lines;
    });

    return {
        highlighterChanges,
        scrollToLine: findScrollTarget( lineChanges ),
    };
};


const findScrollTarget = (changes: { startLine?: number; endLine?: number }[]) => {
    let maxRange = -1;
    let target: number | undefined;

    for ( const change of changes ) {
        if (change.startLine === undefined) continue;

        const end = change.endLine ?? change.startLine;
        const range = end - change.startLine;

        if ( range > maxRange ) {
            maxRange = range;
            target = Math.floor( ( change.startLine + end ) / 2 );
        }
    }

    return target;
};

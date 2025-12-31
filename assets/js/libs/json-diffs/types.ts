export type ChangeType = "added" | "removed" | "modified";

export interface JSONChange {
    type: ChangeType;
    path: string;
    oldValue?: unknown;
    newValue?: unknown;
    startLine?: number;
    endLine?: number;
}

export type LineChanges = {
    startLine: number;
    endLine: number;
}

export interface DiffResult {
    highlighterChanges: number[];
    scrollToLine?: number;
}

export type JsonObject = Record<string, unknown>;


export interface LineRange {
    start: number;
    end: number;
}

export type LineMap = Record<string, LineRange>;

export interface TraversalState {
    pathStack: (string | number)[];
    arrayStack: number[];
    openStack: {
        path: string;
        indent: number;
        isArray: boolean;
    }[];
}

export interface ParsedLine {
    apply(map: LineMap, lineNumber: number): void;
}

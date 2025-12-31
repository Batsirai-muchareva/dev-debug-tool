// export interface TraversalState {
//     pathStack: (string | number)[];
//     arrayStack: number[];
//     openStack: { path: string; indent: number; isArray: boolean }[];
// }
//
// export const createTraversalState = (): TraversalState => ({
//     pathStack: [],
//     arrayStack: [],
//     openStack: [],
// });
//
// export const enterKey = (
//     state: TraversalState,
//     key: string,
//     depth: number
// ): string => {
//     state.pathStack.length = Math.max( 0, depth - 1 );
//     state.pathStack.push( key );
//
//     return state.pathStack.join( "." );
// };
//
// export const enterArrayElement = (
//     state: TraversalState,
//     depth: number
// ): string => {
//     const idx = state.arrayStack.length - 1;
//     state.arrayStack[idx]++;
//
//     state.pathStack.length = Math.max( 0, depth - 1 );
//     state.pathStack.push(state.arrayStack[idx]);
//
//     return state.pathStack.join(".");
// };
//
// export const exitArrayElement = (state: TraversalState) => {
//     if ( state.pathStack.length > 0 && typeof state.pathStack[ state.pathStack.length - 1 ] === "number" ) {
//         state.pathStack.pop();
//     }
// };
//
// export const openBlock = (
//     state: TraversalState,
//     path: string,
//     indent: number,
//     isArray: boolean
// ) => {
//     state.openStack.push( { path, indent, isArray } );
//
//     if ( isArray ) {
//         state.arrayStack.push( -1 );
//     }
// };
//
// export const closeBlock = (
//     state: TraversalState,
//     indent: number
// ): string | null => {
//     for ( let i = state.openStack.length - 1; i >= 0; i-- ) {
//         const entry = state.openStack[i];
//
//         if ( entry.indent === indent ) {
//             state.openStack.splice( i, 1 );
//
//             if ( entry.isArray ) {
//                 state.arrayStack.pop();
//                 exitArrayElement( state );
//             }
//
//             return entry.path;
//         }
//     }
//     return null;
// };
//
// export const isInsideArray = ( state: TraversalState ) =>
//     state.arrayStack.length > 0;
//
//
// // export const enterObjectKey = (
// //     state: TraversalState,
// //     key: string,
// //     depth: number
// // ): string => {
// //     state.pathStack.length = Math.max(0, depth - 1);
// //     state.pathStack.push(key);
// //     return state.pathStack.join(".");
// // };
// //
// // export const enterArrayItem = (
// //     state: TraversalState,
// //     depth: number
// // ): string => {
// //     if (state.arrayIndexStack.length === 0) {
// //         state.arrayIndexStack.push(-1);
// //     }
// //
// //     const index =
// //         ++state.arrayIndexStack[state.arrayIndexStack.length - 1];
// //
// //     state.pathStack.length = Math.max(0, depth - 1);
// //     state.pathStack.push(index);
// //
// //     return state.pathStack.join(".");
// // };
// //
// // export const exitArrayItem = (state: TraversalState) => {
// //     if (typeof state.pathStack[state.pathStack.length - 1] === "number") {
// //         state.pathStack.pop();
// //     }
// // };
// //
// // export const openBlock = (
// //     state: TraversalState,
// //     path: string,
// //     indent: number,
// //     isArray: boolean
// // ) => {
// //     state.openStack.push({ path, indent, isArray });
// //
// //     if (isArray) {
// //         state.arrayIndexStack.push(-1);
// //     }
// // };
// //
// // export const closeBlock = (
// //     state: TraversalState,
// //     indent: number
// // ): string | null => {
// //     for (let i = state.openStack.length - 1; i >= 0; i--) {
// //         const entry = state.openStack[i];
// //
// //         if (entry.indent === indent) {
// //             state.openStack.splice(i, 1);
// //
// //             if (entry.isArray) {
// //                 state.arrayIndexStack.pop();
// //                 exitArrayItem(state);
// //             }
// //
// //             return entry.path;
// //         }
// //     }
// //     return null;
// // };
// //
//
// // export const closeBlock = (
// //     state: TraversalState,
// //     indent: number
// // ): string | null => {
// //     for (let i = state.openStack.length - 1; i >= 0; i--) {
// //         const entry = state.openStack[i];
// //
// //         if (entry.indent === indent) {
// //             state.openStack.splice(i, 1);
// //
// //             if (entry.isArray) {
// //                 state.arrayIndexStack.pop();
// //             }
// //
// //             exitArrayItem(state);
// //             return entry.path;
// //         }
// //     }
// //
// //     return null;
// // };
//
//
// // export const isInsideArray = (state: TraversalState): boolean =>
// //     state.arrayIndexStack.length > 0;

import { TraversalState } from "@libs/json-diffs/types";

export const createTraversalState = (): TraversalState => ({
    pathStack: [],
    arrayStack: [],
    openStack: [],
});

export const enterKey = (
    state: TraversalState,
    key: string,
    depth: number
): string => {
    state.pathStack.length = Math.max(0, depth - 1);
    state.pathStack.push(key);
    return state.pathStack.join(".");
};

export const enterArrayElement = (
    state: TraversalState,
    depth: number
): string => {
    const idx = state.arrayStack.length - 1;
    state.arrayStack[idx]++;

    state.pathStack.length = Math.max(0, depth - 1);
    state.pathStack.push(state.arrayStack[idx]);
    return state.pathStack.join(".");
};

export const exitArrayElement = (state: TraversalState) => {
    if (typeof state.pathStack[state.pathStack.length - 1] === "number") {
        state.pathStack.pop();
    }
};

export const openBlock = (
    state: TraversalState,
    path: string,
    indent: number,
    isArray: boolean
) => {
    state.openStack.push({ path, indent, isArray });
    if (isArray) state.arrayStack.push(-1);
};

export const closeBlock = (
    state: TraversalState,
    indent: number
): string | null => {
    for (let i = state.openStack.length - 1; i >= 0; i--) {
        const entry = state.openStack[i];
        if (entry.indent === indent) {
            state.openStack.splice(i, 1);

            if (entry.isArray) {
                state.arrayStack.pop();
                exitArrayElement(state);
            }

            return entry.path;
        }
    }
    return null;
};

export const isInsideArray = (state: TraversalState) =>
    state.arrayStack.length > 0;

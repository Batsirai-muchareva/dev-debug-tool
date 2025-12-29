// type Context = {
//     path: string,
//     indent: number,
//     line: number,
//     lineMap: {},
//     changes: [],
// };
//
// function diffWithLineNumbers(
//     oldNode: unknown,
//     newNode: unknown,
//     context = createContext()
// ) {
//     walk( oldNode, newNode, context );
//
//     return context.changes;
// }
//
// /* -------------------------------------------------------------------------- */
// /*                                  WALKER                                    */
// /* -------------------------------------------------------------------------- */
//
// function walk( oldNode: unknown, newNode: unknown, ctx) {
//     const { path, indent } = ctx;
//
//     // Assign line number for this node
//     ctx.line++;
//     ctx.lineMap[path] = ctx.line;
//
//     // Primitive value
//     if (!isObject(newNode)) {
//         if (oldNode !== newNode) {
//             ctx.changes.push({
//                 type: oldNode === undefined ? "added" : "modified",
//                 path,
//                 line: ctx.line,
//                 oldValue: oldNode,
//                 newValue: newNode,
//             });
//         }
//         return;
//     }
//
//     // Opening brace
//     ctx.line++;
//
//     const oldKeys = isObject(oldNode) ? Object.keys(oldNode) : [];
//     const newKeys = Object.keys(newNode);
//     const visited = new Set();
//
//     // Handle added & modified
//     for (const key of newKeys) {
//         visited.add(key);
//
//         const childPath = path ? `${path}.${key}` : key;
//
//         ctx.line++;
//         ctx.lineMap[childPath] = ctx.line;
//
//         walk(
//             oldNode?.[key],
//             newNode[key],
//             nextContext(ctx, childPath, indent + 1)
//         );
//     }
//
//     // Handle removed
//     for (const key of oldKeys) {
//         if (!visited.has(key)) {
//             const childPath = path ? `${path}.${key}` : key;
//
//             ctx.changes.push({
//                 type: "removed",
//                 path: childPath,
//                 line: ctx.line,
//                 oldValue: oldNode[key],
//             });
//         }
//     }
//
//     // Closing brace
//     ctx.line++;
// }
//
// /* -------------------------------------------------------------------------- */
// /*                                  CONTEXT                                   */
// /* -------------------------------------------------------------------------- */
//
// function createContext(): Context {
//     return {
//         path: "",
//         indent: 0,
//         line: 0,
//         lineMap: {},
//         changes: [],
//     };
// }
//
// function nextContext(ctx, path, indent) {
//     return {
//         ...ctx,
//         path,
//         indent,
//     };
// }
//
// /* -------------------------------------------------------------------------- */
// /*                                  HELPERS                                   */
// /* -------------------------------------------------------------------------- */
//
// function isObject(value) {
//     return typeof value === "object" && value !== null;
// }

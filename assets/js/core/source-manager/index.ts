import { editorProvider } from "@app/providers/editor/provider";
import { databaseProvider } from "@app/providers/database/provider";
import { schemaProvider } from "@app/providers/schema/provider";
// import { createSource } from "@app/source-manager/create-source";
import { sourceManager } from "@app/source-manager/source-manager";
// sourceManager
// createSource
const registerDataSources = () => {
    sourceManager.registerSource( editorProvider );
    sourceManager.registerSource( databaseProvider );
    sourceManager.registerSource( schemaProvider );
}
// //
// // createSource
export {
    // sourceManager,
    // createSource,
    registerDataSources,
}
// sourceManager

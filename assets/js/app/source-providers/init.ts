import { sourceProviderRepository } from "./source-provider-repository";
import { databaseSourceProvide } from "./providers/database-source-provider";
import { editorSourceProvider } from "./providers/editor-source-provider";

export function initSourceProvider() {
    sourceProviderRepository.register( editorSourceProvider );
    sourceProviderRepository.register( databaseSourceProvide )
}

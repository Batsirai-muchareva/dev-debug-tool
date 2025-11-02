import { sourceProviderRepository } from "./source-provider-repository";
import { databaseSourceProvide } from "./providers/database-source-provider";
import { editorSourceProvider } from "./providers/editor-source-provider";
import { styleSchema } from "./providers/style-schema";

export function initSourceProvider() {
    sourceProviderRepository.register( editorSourceProvider );
    sourceProviderRepository.register( databaseSourceProvide )
    // sourceProviderRepository.register( styleSchema )
}

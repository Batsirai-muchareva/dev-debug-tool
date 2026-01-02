import { createDataProviderManager } from '@app/manager/create-data-provider-manager';
import { editorProvider } from "@app/providers/editor/provider";
import { databaseProvider } from "@app/providers/database/provider";
import { schemaProvider } from "@app/providers/schema/provider";

export const dataProviderManager = createDataProviderManager();

export function registerDataProviders() {
    dataProviderManager.registerSource( editorProvider );
    dataProviderManager.registerSource( databaseProvider );
    dataProviderManager.registerSource( schemaProvider );
}

export const getProviderConfig = () => dataProviderManager.getProvidersConfig();

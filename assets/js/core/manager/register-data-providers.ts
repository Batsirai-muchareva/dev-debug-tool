import { createDataProviderManager } from '@app/manager/create-data-provider-manager';
import { databaseProvider } from "@app/providers/database-provider/provider";
import { editorProviderNew } from "@app/providers/editor-provider/provider";

export const dataProviderManager = createDataProviderManager();

export function registerDataProviders() {
    dataProviderManager.registerSource( editorProviderNew )
    dataProviderManager.registerSource( databaseProvider )
}

export const getProviderConfig = () => dataProviderManager.getProvidersConfig();

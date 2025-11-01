import { SourceProvider } from "../types";

const createSourceProviderRepository = () => {
    const providers: SourceProvider[] = [];

    const register = ( provider: SourceProvider ) => {
        providers.push( provider );
    };

    const getProviders = () => providers;

    const getProvider = ( key: SourceProvider['key'] ) =>
        providers.find( provider => provider.key === key )

    return {
        register,
        getProvider,
        getProviders,
    }
}

export const sourceProviderRepository = createSourceProviderRepository();

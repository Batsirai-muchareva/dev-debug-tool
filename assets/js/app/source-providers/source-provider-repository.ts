import { SourceProvider } from "./create-source-provider";

const createSourceProviderRepository = () => {
    const providers: SourceProvider[] = [];

    const register = ( provider: SourceProvider ) => {
        providers.push( provider );
    };

    const getProviders = () => {
        return providers.slice( 0 ).sort( ( a, b ) => ( a.priority > b.priority ? -1 : 1 ) );
    };

    return {
        register,
        getProviders,
    }
}

export const sourceProviderRepository = createSourceProviderRepository();

import { DataProvider } from "@app/types";

// makes it favourable for 3rd party
export const createDataProviderManager = () => {
    const providers = new Map< DataProvider['id'], DataProvider >();

    const registerSource = ( providerFxn: () => DataProvider ) => {
        const provider = providerFxn();

        if ( providers.has( provider.id ) ) {
            throw new Error(`Source ${ provider.id } is already registered`);
        }

        providers.set( provider.id, provider );
    }

    const getSource = ( id: DataProvider['id'] ) => providers.get( id );

    const getAllProviders = () => Array.from( providers.values() );

    const getProvidersConfig = (): Omit<DataProvider, 'subscribe'>[] => {
        return Array.from( providers.values() )
            .map( ( { subscribe, shouldShowData, ...rest } )  => (
                {
                    ...rest,
                    shouldShowData: shouldShowData ?? ( ( data ) => !! data ),
                } )
            )
            .sort((a, b) =>
                ( a.order ?? 10 ) - ( b.order ?? 10 )
            );
    };

    return {
        registerSource,
        getAllProviders,
        getSource,
        getProvidersConfig
    }
}

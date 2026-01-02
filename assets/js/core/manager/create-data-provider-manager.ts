import { Provider, Variant } from "@app/types";

// makes it favourable for 3rd party
export const createDataProviderManager = () => {
    const providers = new Map< Provider['id'], Provider >();

    const registerSource = ( providerFxn: () => Provider<any, any> ) => {
        const provider = providerFxn();

        if ( providers.has( provider.id ) ) {
            throw new Error(`Source ${ provider.id } is already registered`);
        }

        providers.set( provider.id, provider );
    }

    // providerId should be top level not passed
    const getSource = ( providerId: Provider['id'], variantId: Variant['id'] ) => {
        const variant = providers.get( providerId )
            ?.variants
            .find( ( { id } ) =>
                id === variantId
            );

        if ( ! variant ) {
            throw Error( ' Variant not found' )
        }

        return variant;
    }

    const getAllProviders = () => Array.from( providers.values() );

    const getProvidersConfig = (): Omit<Provider, 'subscribe'>[] => {
        return Array.from( providers.values() )
            .map( ( { shouldShowData, variants, ...rest } )  => (
                {
                    ...rest,
                    shouldShowData: shouldShowData ?? ( ( data ) => !! data ),
                    variants: variants.map( v => ( {
                        ...v, shouldShowData: v.shouldShowData ?? ( () => true )  } ) )
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

import { SourceHandler } from "../../types";

export const promiseHandler: SourceHandler = ( provider, updateSnapshot ) => {
    if ( provider.actions.type !== 'promise' ) {
        throw new Error( 'Invalid handler for provider type' );
    }

    updateSnapshot( provider.key, { status: 'loading' } );

    const fetchData = async () => {
        try {
            const data =  await ( provider.actions as any ).fetch(); // TODO to fix this not to use any

            updateSnapshot( provider.key, { status: 'success', data } );
        } catch ( error ) {
            updateSnapshot( provider.key, {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            } );
        }
    };

    fetchData().then( console.log );

    return () => {};
};

import { Data, SourceProvider } from "../../types";
import { listenTo, STYLE_SCHEMA_PATH_UPDATED } from "../../events";
import { getValueFromPath } from "../../utils/get-value-from-path";

function limitObjects( data: any ): Data {
    return Object.fromEntries(
        Object.keys(data).slice(0, 2).map(key => [key, data[key]])
    ) as Data;
}
export const styleSchema: SourceProvider = {
    key: 'style-schema',
    label: 'Style Schema',
    // executionCondition: () => true,
    // extra: {
    //     setPath: ( path: string ) => {
    //
    //     }
    // },
    actions: {
        type: 'subscription',
        subscribe: ( onUpdate, onIdle ) => {
            const data = ( window as any ).elementor.config.atomic.styles_schema;
            // const slice = Object.keys( data ).slice(0, 10);


            const slice = limitObjects( data )


            onUpdate( slice as Data )

            return listenTo( STYLE_SCHEMA_PATH_UPDATED, ( event: any ) => {
                const path = event.detail.path;
                const result = getValueFromPath( data, path );
                let limited = result;

                if ( result ) {
                    limited =  Object.keys( result ).length > 10 ? { result: limitObjects( result ) } : limitObjects( { result } );
                }

                onUpdate( result ? ( limited as any ).result : slice );
            } )
        }
    }
};

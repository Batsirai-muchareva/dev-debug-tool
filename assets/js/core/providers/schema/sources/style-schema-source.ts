import { DataSourceFactory, Notify } from "@app/types";
import { SchemaData } from "@app/providers/schema/types";
import { elementorAdapter } from "@app/adapters";
import { eventBus } from "@app/events";
import { createValueFromPath } from "@app/utils/create-value-from-path";

// composition which wraps the notififyer so that I dont have to do notify = notifyFn;
export const createStyleSchemaSource: DataSourceFactory< SchemaData >  = () => {
    let notify: Notify< SchemaData > | null = null;

    return {
        start( notifyFn: Notify<SchemaData> ) {
            notify = notifyFn;

            const schema = elementorAdapter.getStyleSchema();
            const keys = Object.keys( schema );

            notify( keys as unknown as SchemaData );

            eventBus.on( 'style-schema:clicked', ( { line: index } ) => {
                console.log( schema[ keys[index] ] );

                notify?.( schema[ keys[index] ] as any );
            } );
        },
        stop: () => {

        },
    }
};

// export

// const createSource = ( sourceFxn: ( notifyFn: Notify<any> ) => void ) => {
//     let notify: Notify<DatabaseData> | null = null;
//
//     // sourceFxn( notify )
//
//
// }

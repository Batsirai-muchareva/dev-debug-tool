import { Provider } from "@app/types";
import { SchemaData } from "@app/providers/schema/types";
import { createSource } from "@app/data-source-manager/create-source";
import { elementorAdapter } from "@app/adapters";
import { eventBus } from "@app/events";

export const schemaProvider =
    (): Provider< SchemaData > => {

    return {
        id: 'schema',
        title: 'Schema',
        order: 3,
        supportsBrowsing: true,
        variants: [
            {
                id: 'style-schema',
                label: 'Style Schema',
                createSource: createSource( ( notify ) => {
                    const schema = elementorAdapter.getStyleSchema();

                    const getKeys = () => {
                        return Object.keys( schema );
                    }

                    return {
                        setup: () => {
                            notify( getKeys() as unknown as SchemaData );

                            eventBus.on( 'browse:key:selected', ( { key } ) => {
                                 notify( schema[ key ] as SchemaData );
                            } );
                        },
                        teardown: () => {}
                    }
                } )
            }
        ]
    }
}

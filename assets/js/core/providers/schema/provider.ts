import { Provider } from "@app/types";
import { elementorAdapter } from "@app/adapters";
import { createSource } from "@app/source-manager/create-source";

export type SchemaData = Record<string, unknown>;

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
                    return {
                        setup: () => {
                            notify( elementorAdapter.getStyleSchema() );
                        },
                    }
                } )
            }
        ]
    }
}

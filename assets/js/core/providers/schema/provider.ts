import { Provider } from "@app/types";
import { SchemaData } from "@app/providers/schema/types";
import { createSchemaVariants } from "@app/providers/schema/create-schema-variants";

export const schemaProvider =
    (): Provider< SchemaData > => {

    return {
        id: 'schema',
        title: 'Schema',
        order: 3,
        variants: createSchemaVariants()
    }
}

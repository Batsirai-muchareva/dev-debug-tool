import { Variant } from "@app/types";
import { SchemaData } from "@app/providers/schema/types";
import { createStyleSchemaSource } from "@app/providers/schema/sources/style-schema-source";

export const createSchemaVariants =
    (): Variant< SchemaData >[] => {

    return [
        {
            id: 'style-schema',
            label: 'Schema',
            order: 1,
            icon: 'eicon-code',
            description: 'View data for the Style schema',
            sourceConfig: {},
            createSource: createStyleSchemaSource
        }
    ]
}

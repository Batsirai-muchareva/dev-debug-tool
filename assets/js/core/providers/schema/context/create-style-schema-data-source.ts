import { SchemaDataSource } from '@libs/schema-browser';
import { schemaAdapter } from '@app/adapters/elementor/schema';

/**
 * Create a SchemaDataSource for the style schema.
 *
 * This connects the schema-browser lib to the Elementor style schema data.
 * The lib handles the UI, this provides the data.
 */
export const createStyleSchemaDataSource = (): SchemaDataSource => {
    return {
        getKeys: () => schemaAdapter.getKeys(),

        getData: (key: string) => schemaAdapter.getSchema(key),

        searchKeys: (query: string) => schemaAdapter.searchKeys(query),

        getCount: () => schemaAdapter.getCount(),

        isAvailable: () => schemaAdapter.isAvailable(),
    };
};

/**
 * Singleton instance for use in components.
 * Created lazily to ensure Elementor is loaded.
 */
let dataSourceInstance: SchemaDataSource | null = null;

export const getStyleSchemaDataSource = (): SchemaDataSource => {
    if (!dataSourceInstance) {
        dataSourceInstance = createStyleSchemaDataSource();
    }
    return dataSourceInstance;
};

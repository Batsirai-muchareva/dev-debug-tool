import { Provider } from "@app/types";
import { createDatabaseVariants } from "@app/providers/database/create-database-variants";
import { DatabaseData, SourceConfig } from "@app/providers/database/types";

export const databaseProvider =
    (): Provider<DatabaseData, SourceConfig> => {

    return {
        id: 'database',
        title: 'Database',
        order: 2,
        variants: createDatabaseVariants(),
    }
}

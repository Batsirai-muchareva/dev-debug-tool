import { getSettings } from "@app/sync/get-settings";
import { Variant } from "@app/types";
import { createDatabaseSource } from "@app/providers/database/sources/database-source";
import { DatabaseData, SourceConfig } from "@app/providers/database/types";
import { elementorAdapter } from "@app/adapters";

export const createDatabaseVariants =
    (): Variant< DatabaseData, SourceConfig >[] => {
    const { metaKeys, kitId } = getSettings();

    return [
        {
            id: 'post',
            label: 'Post',
            order: 1,
            sourceConfig: {
                metaKey: metaKeys.post,
                postId: elementorAdapter.postId,
            },
            createSource: createDatabaseSource
        },
        {
            id: 'variables',
            label: 'Variables',
            order: 2,
            sourceConfig: {
                metaKey: metaKeys.variables,
                postId: kitId,
            },
            createSource: createDatabaseSource
        },
        {
            id: 'global_classes',
            label: 'Classes',
            order: 3,
            sourceConfig: {
                metaKey: metaKeys.global_classes,
                postId: kitId,
                refreshOnSave: true,
            },
            createSource: createDatabaseSource,
        }
    ]
}

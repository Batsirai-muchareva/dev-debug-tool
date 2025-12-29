import { Variant } from "@app/types";
import { createLocalSource } from "@app/providers/editor/sources/local-source";
import {
    createGlobalClassesSource,
} from "@app/providers/editor/sources/global-classes-source";
import { GlobalClasses, LocalElementData } from "@app/adapters/elementor/elementor-adapter";

export type EditorData = LocalElementData | GlobalClasses;

export const createEditorVariants =
    (): Variant< EditorData, { onIdle?: () => void } >[] => {
    return [
        {
            id: 'local',
            label: 'Local',
            order: 1,
            icon: 'eicon-code',
            description: 'View data for the selected element',
            sourceConfig: {},
            createSource: createLocalSource
        },
        {
            id: 'global_classes',
            label: 'Classes',
            order: 2,
            icon: 'eicon-global-colors',
            description: 'View global CSS classes applied to element',
            sourceConfig: {
                onIdle: () => {
                    // event to switch to editor
                }
            },
            createSource: createGlobalClassesSource
        }
    ]
}

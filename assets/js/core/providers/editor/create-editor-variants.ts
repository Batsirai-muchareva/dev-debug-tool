import { Variant } from "@app/types";
import { createLocalSource } from "@app/providers/editor/sources/local-source";
import {
    createGlobalClassesSource,
} from "@app/providers/editor/sources/global-classes-source";
import { EditorData } from "@app/providers/editor/types";


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
            createSource: createGlobalClassesSource,
            shouldShowData: ( data) =>
                Array.isArray( data ) && data.length > 0,

            getEmptyMessage: () =>
                'No Global classes assigned to this element',
        }
    ]
}

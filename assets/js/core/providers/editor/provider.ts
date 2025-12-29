import { Provider } from "@app/types";
import { createEditorVariants, EditorData } from "@app/providers/editor/create-editor-variants";

export const editorProvider =
    (): Provider< EditorData, { onIdle?: () => void } > => {

    return {
        id: 'editor',
        title: 'Editor',
        order: 1,
        variants: createEditorVariants(),
        getMessage: ( data, variantId ) => {
            if ( variantId === 'global_classes' && data ) {

                if ( (data as []).length === 0 ) {
                    return 'No Global classes assigned to class'
                }
            }

            return 'Please select element to see live snapshots of data'
        },
    }
}

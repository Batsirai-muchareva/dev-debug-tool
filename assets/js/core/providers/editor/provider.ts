import { Provider } from "@app/types";
import { createEditorVariants } from "@app/providers/editor/create-editor-variants";
import { EditorData } from "@app/providers/editor/types";

export const editorProvider =
    (): Provider< EditorData, { onIdle?: () => void } > => {

    return {
        id: 'editor',
        title: 'Editor',
        order: 1,
        variants: createEditorVariants(),
        emptyMessage: 'Please select element to see live snapshots of data',
    }
}
//         if ( variantId === 'global_classes' && data ) {
//
//                 if ( ( data as [] ).length === 0 ) {
//                     return 'No Global classes assigned to class'
//                 }
//             }

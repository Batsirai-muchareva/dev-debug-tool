import { EditorMode, Mode } from "@app/providers/editor-provider/modes/types";
import { globalClassesMode } from "@app/providers/editor-provider/modes/global-classes-mode/global-classes-mode";
import { localMode } from "@app/providers/editor-provider/modes/local-mode/local-mode";
import { dispatchCustomEvent } from "@app/events/dispatcher/dispatch-custom-event";
import { SWITCH_SUB_TAB_EVENT } from "@app/events/event-lists";

export function createEditorModes(
    notify: ( data: any ) => void,
    switchTo: ( mode: Mode ) => void
): Record<Mode, EditorMode> {
    return {
        local: localMode( notify ),
        global_classes: globalClassesMode( notify, () => {
            switchTo( 'local' );
            dispatchCustomEvent( SWITCH_SUB_TAB_EVENT, { id: 'local' } )
        } ),
        // 🔮 future modes go here:
        // global_colors: createGlobalColorsMode(...)
        // typography: createTypographyMode(...)
    };
}

import { Callback, DataProvider } from "@app/types";
import { EditorMode, Mode } from "@app/providers/editor-provider/modes/types";
import { createEditorModes } from "@app/providers/editor-provider/modes/create-editor-modes";
import { listenToEvent } from "@app/events/listeners/listen-to-event";
import { DataGetEvent } from "@app/events/event-lists";

const ID = 'editor';

export function editorProviderNew(): DataProvider {
    let subscriber: Callback | null = null;
    let activeMode: EditorMode | null = null;

    const notify = (data: any) => {
        subscriber?.(data);
    };

    const switchMode = ( id: Mode ) => {
        activeMode?.stop();

        activeMode = modes[ id ];
        activeMode.start();
    };

    const modes = createEditorModes( notify, switchMode );

    const subscribe = (cb: Callback) => {
        subscriber = cb;
        const events = Object.keys( modes ).map( ( key ) => DataGetEvent( ID, key ) );

        // Default mode
        switchMode( 'local' );

        const unsubscribeRefetch = listenToEvent<{ id: Mode }>(
            events,
            async ( { detail } ) => {
                switchMode( detail.id );
            }
        );

        return () => {
            unsubscribeRefetch() // test this is unsubscribing
        }
    };

    // reload all on database publish either post , variables or global classes

    return {
        id: ID,
        title: 'Editor',
        subscribe,
        getMessage: () =>
            'Please select element to see live snapshots of data',
        order: 1,
        variants: Object.fromEntries(
            Object.values(modes).map(m => [m.id, { label: m.label }])
        ),
    };
}

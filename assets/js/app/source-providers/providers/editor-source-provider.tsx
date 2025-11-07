import { getSelectedElement } from "../../sync/get-selected-element";
import { subscribeToCommand } from "../../sync/subscribe-to-command";
import { SourceProvider } from "../../types";

/* Subscription pattern (editor) */
export const editorSourceProvider: SourceProvider = {
    key: 'editor',
    label: 'Editor',
    idleMessage: 'Please select an element to view its data',
    actions: {
        type: 'subscription',
        subscribe: ( onUpdate, onIdle ) => {
            const element = getSelectedElement();

            if ( ! element ) {
                onIdle();

                return () => {};
            }

            const handleUpdate = () => {
                onUpdate( element.model.toJSON( { remove: ['defaultEditSettings', 'editSettings'] } ) );
            };

            const handleDestroy = () => {
                onIdle();
            };

            element.model.on( 'change', handleUpdate );
            element.model.get( 'settings' ).on( 'change', handleUpdate );
            element.model.on( 'destroy', handleDestroy );

            handleUpdate(); // Initial update

            return () => {
                element.model.off( 'change', handleUpdate );
                element.model.off( 'destroy', handleDestroy );
                element.model.get( 'settings' ).off('change', handleUpdate );
            };
        },
    },
    lifecycle: {
        onMount: ( refetch ) => {
            return subscribeToCommand('run:after', ( _, command) => {
                if ( command === 'document/elements/select' || command === 'document/elements/deselect-all' ) {
                    refetch();
                }
            });
        }
    }
};

import { getSelectedElement } from "../sync/get-selected-element";
import { createSourceProvider } from "./create-source-provider";
import { subscribeToElementorCommand } from "../sync/subscribe-to-elementor-command";

/* Subscription pattern (editor) */
export const editorSourceProvider = createSourceProvider( {
    key: 'editor',
    label: 'Editor',
    priority: 11,
    canGetData: () => !! getSelectedElement(),
    emptyMessage: 'Please select an element to view its data',
    actions: {
        subscribe: ( onUpdate: (data: any) => void ) => {
            const element = getSelectedElement();

            if ( ! element ) {
                return onUpdate( null );
            }

            const handleUpdate = () => {
                onUpdate( element.model.toJSON() );
            };

            const handleDestroy = () => {
                onUpdate( null );
                cleanup();
            };

            const cleanup = () => {
                element.model.off('change', handleUpdate );
                element.model.off('destroy', handleDestroy );
            };

            element.model.on( 'change', handleUpdate );
            element.model.on( 'destroy', handleDestroy );

            handleUpdate();

            return cleanup;
        },
        initializeListeners: ( onElementChange ) => {
            subscribeToElementorCommand('run:after', ( component, command, args ) => {
                const shouldNotify =
                    command === 'document/elements/select' ||
                    command === 'document/elements/deselect-all';

                if ( shouldNotify ) {
                    onElementChange();
                }
            } )
        }
    },
} );

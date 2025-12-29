import { getElementorCommands } from "@app/adapters/elementor/sync/get-elementor-commands";
import { ElementData, getSelectedElement, StyleDefinition } from "@app/adapters/elementor/sync/get-selected-element";
import { getPostId } from "@app/adapters/elementor/sync/post-id";
import {
    createElementEventSubscriber,
} from "@app/adapters/elementor/marionette-element/create-element-event-subscriber";
import { dataExtractor } from "@app/adapters/elementor/marionette-element/data-extractor";
import { getUsedGlobalClassesSnapshot } from "@app/adapters/elementor/get-used-global-classes-snapshot";

export type ElementorCommand =
    | 'document/elements/select'
    | 'document/elements/deselect'
    | 'document/elements/deselect-all'
    | 'document/elements/delete'
    | 'document/elements/create'
    | 'document/save/update'
    | 'document/save/default'
    | 'panel/exit'
    | 'panel/open'
    | 'panel/close';

type Unsubscribe = () => void;

type Callback<T = void> = (data: T) => void;

const LOG_PREFIX = '[DevDebugTool:ElementorAdapter]';

export type GlobalClasses = Array<StyleDefinition>;

export type LocalElementData = ElementData;

const createElementorAdapter = () => {
    return {
        onCommand: (
            commandList: ElementorCommand | ElementorCommand[],
            handler: Callback
        ): Unsubscribe => {
            const commands = getElementorCommands();

            const toWatch = Array.isArray( commandList ) ? commandList : [ commandList ];

            const internalHandler = ( _: unknown, command: string ) => {
                if ( toWatch.includes( command as ElementorCommand ) ) {
                    debug( `Command triggered: ${command}` );

                    try {
                        handler();
                    } catch ( error ) {
                        console.error( `${LOG_PREFIX} Error in command handler:`, error );
                    }
                }
            };

            commands.on( 'run:after', internalHandler );
            debug( `Subscribed to commands: ${ toWatch.join(', ') }` );

            return () => {
                commands.off( 'run:after', internalHandler );
                debug( `Unsubscribed from commands: ${ toWatch.join(', ') }` );
            }
        },
        getSelectedElement,
        postId: getPostId(),
        elementSubscriber: createElementEventSubscriber(),
        elementDataExtractor: dataExtractor,
        getUsedGlobalClassesSnapshot: getUsedGlobalClassesSnapshot,
        toolbarHeight: () => {
            const toolbar = document.getElementById( 'elementor-editor-wrapper-v2' );

            return toolbar?.offsetHeight ?? null
        }
    }
}

function debug( message: string, ...args: unknown[] ): void {
    // TODO to be removed
    if ( process.env.NODE_ENV === 'development' ) {
        console.debug( `${LOG_PREFIX} ${message}`, ...args );
    }
}

export const elementorAdapter = createElementorAdapter();

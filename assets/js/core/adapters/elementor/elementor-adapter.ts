import { getElementorCommands } from "@app/adapters/elementor/sync/get-elementor-commands";
import { getSelectedElement } from "@app/adapters/elementor/sync/get-selected-element";

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
    }
}

function debug( message: string, ...args: unknown[] ): void {
    // TODO to be removed
    if ( process.env.NODE_ENV === 'development' ) {
        console.debug( `${LOG_PREFIX} ${message}`, ...args );
    }
}

export const elementorAdapter = createElementorAdapter();

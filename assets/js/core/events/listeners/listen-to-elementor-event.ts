import { getElementorCommands } from "@app/sync/get-elementor-commands";
import { Callback } from "@app/types";

export type ElementorEvents = string | string[];

export const listenToElementorEvent = ( command: ElementorEvents, callback: Callback ) => {
    const elementorCommands = getElementorCommands();

    const commandsToListen = Array.isArray( command ) ? command : [ command ];

    const handler = ( _: unknown, elementorCommand: string ) => {
        if ( commandsToListen.includes( elementorCommand ) ) {
            callback();
        }
    };

    elementorCommands.on( 'run:after', handler );

    return () => {
        elementorCommands.off( 'run:after', handler );
    };
}

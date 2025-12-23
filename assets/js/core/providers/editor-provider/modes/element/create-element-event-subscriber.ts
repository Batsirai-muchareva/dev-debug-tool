import { EventCallback, EventEmitter, MarionetteElement } from "@app/sync/get-selected-element";

type EventSubscriber = {
    subscribe: ( element: MarionetteElement, callback: EventCallback ) => () => void;
}
export const createElementEventSubscriber = (): EventSubscriber => ( {
    subscribe: (element: MarionetteElement, callback: EventCallback) => {
        const handlers: Array< {
            target: EventEmitter;
            event: string;
            handler: EventCallback;
        } > = [];

        const registerHandler = ( target: EventEmitter, event: string ) => {
            const handler = () => callback( element );

            target.on( event, handler );
            handlers.push( { target, event, handler } );
        };

        // Subscribe to model changes
        registerHandler( element.model, 'change' );

        // Subscribe to settings changes
        const settings = element.model.get( 'settings' );
        registerHandler( settings, 'change' );

        // Subscribe to destroy
        registerHandler( element.model, 'destroy' );

        // Return cleanup function
        return () => {
            handlers.forEach( ( { target, event, handler } ) => {
                target.off( event, handler );
            } );

            handlers.length = 0;
        };
    }
} );

import { ElementorEvents, listenToElementorEvent } from "@app/events/listeners/listen-to-elementor-event";
import { Callback } from "@app/types";

export const createElementorEventSubscriber = () => {
    const cleanups: Array<() => void> = [];

    const subscribe = ( commands: ElementorEvents, handler: Callback ) => {
        const cleanup = listenToElementorEvent( commands, handler );

        cleanups.push( cleanup );
    };

    const unsubscribeAll = () => {
        cleanups.forEach( fn => fn() );
        cleanups.length = 0;
    };

    return { subscribe, unsubscribeAll };
}

// Great — this clarifies everything.
// Your createCommandSubscriber() is NOT a general-purpose event bus.
// It is a wrapper around Elementor’s $e.commands.on("run:after") system.
//
// So the correct flow is:
// comand subscribe for element element for marionete

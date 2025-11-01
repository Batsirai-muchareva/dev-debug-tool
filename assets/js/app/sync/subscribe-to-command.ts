import { CleanupFn } from "../types";

type EventCallback = (
    component: any,
    command: string,
    args: any
) => void;

interface ElementorWindow extends Window {
    $e: {
        commands: {
            on: ( event: string, callback: EventCallback ) => void;
            off: ( event: string, callback: EventCallback ) => void;
        }
    };
}

export function subscribeToCommand( event: string, callback: EventCallback ): CleanupFn {
    const extendedWindow = window as unknown as ElementorWindow;

    if ( ! extendedWindow.$e?.commands ) {
        console.warn('Elementor API is not available');
        return () => {};
    }

    extendedWindow.$e.commands.on( event, callback );

    return () => {
        extendedWindow.$e.commands.off( event, callback );
    };
}

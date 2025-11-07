export const POSITION_CHANGE_EVENT = 'dev-debug/position/change';
export const WINDOW_RESIZE_EVENT = 'dev-debug/window/resize';
export const POPOVER_OPEN_EVENT = 'dev-debug/popover/open';

export function listenTo( events: string[] | string, listener: ( event: Event ) => void ) {

    const eventArray = Array.isArray( events ) ? events : [events];

    eventArray.forEach( ( event ) => {
        window.addEventListener( event, listener )
    } );

    return () => {
        eventArray.forEach( ( event ) => {
            window.removeEventListener( event, listener )
        } )
    }
}

export function listenToElement( element: HTMLElement, type: string, listener: ( event: Event ) => void ) {
    return element.addEventListener( type, listener );
}

export function dispatchCustomEvent( event: string, options?: Record<string, unknown> ) {
    window.dispatchEvent( new CustomEvent( event, options ) )
}


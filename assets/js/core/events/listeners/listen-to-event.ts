export function listenToEvent<Detail = unknown>(
    events: string[] | string,
    listener: ( event: CustomEvent<Detail> ) => void
) {
    const eventArray = Array.isArray( events ) ? events : [ events ];

    const handler = ( event: Event ) => {
        listener( event as CustomEvent<Detail> );
    };

    eventArray.forEach( ( event ) => {
        window.addEventListener( event, handler )
    } );

    return () => {
        eventArray.forEach( ( event ) => {
            window.removeEventListener( event, handler )
        } )
    }
}

import { Data, SourceHandler } from "../../types";

export const subscriptionHandler: SourceHandler = (provider, updateSnapshot) => {
    if ( provider.actions.type !== 'subscription' ) {
        throw new Error( 'Invalid handler for provider type' );
    }

    function onIdle() {
        updateSnapshot( provider.key, { status: 'idle', message: provider.idleMessage ?? '' } );
    }

    function onUpdate( data: Data ) {
        updateSnapshot( provider.key, { status: 'success', data } );
    }

    onIdle() // TODO: auto triggered not here maybe part of lifecycle

    return provider.actions.subscribe( onUpdate, onIdle );
};

import { sourceHandler } from "./source-handler-registry";
import { subscriptionHandler } from "./handlers/subscription-handler";
import { promiseHandler } from "./handlers/promise-handler";

export function initSourceHandlers() {
    sourceHandler.register( 'subscription', subscriptionHandler );
    sourceHandler.register( 'promise', promiseHandler );
    // sourceHandler.register( 'value', ( provider, updateSnapshot ) =>  {
    //
    //     updateSnapshot( provider.key, { status: "success", data: (provider.actions as any).get()} );
    //
    //     return () => {}
    // } );
}

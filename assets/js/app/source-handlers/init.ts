import { sourceHandler } from "./source-handler-registry";
import { subscriptionHandler } from "./handlers/subscription-handler";
import { promiseHandler } from "./handlers/promise-handler";

export function initSourceHandlers() {
    sourceHandler.register( 'subscription', subscriptionHandler );
    sourceHandler.register( 'promise', promiseHandler );
}

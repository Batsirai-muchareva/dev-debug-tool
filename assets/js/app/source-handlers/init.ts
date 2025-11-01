import { sourceHandler } from "./source-handler-registry";
import { subscriptionHandler } from "./handlers/subscription-handler";
import { promiseHandler } from "./handlers/promise-handler";
import { fallbackHandler } from "./handlers/fallbackHandler";

export function initSourceHandlers() {
    sourceHandler.registerSourceHandler( ( { actions } ) => actions.type === 'subscription', subscriptionHandler );
    sourceHandler.registerSourceHandler( ( { actions } ) => actions.type === 'promise', promiseHandler );
    sourceHandler.registerFallback( fallbackHandler )
}

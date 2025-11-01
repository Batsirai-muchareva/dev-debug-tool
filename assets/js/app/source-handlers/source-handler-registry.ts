import { Data, SourceHandler, SourceProvider } from "../types";


type HandlerMatcher = (provider: SourceProvider) => boolean;

const createSourceHandler = () => {
    const handlerRegistry: Array<{ matcher: HandlerMatcher; handler: SourceHandler; }> = [];
    let fallbackHandler: SourceHandler;

    const registerSourceHandler = ( matcher: HandlerMatcher, handler: SourceHandler ) => {
        handlerRegistry.push({ matcher, handler });
    };

    const registerFallback = ( fallback: SourceHandler ) => {
        fallbackHandler = fallback;
    }

    const getHandlerForProvider = ( provider: SourceProvider ): SourceHandler => {
        const entry = handlerRegistry.find(({ matcher }) => matcher(provider));

        if ( ! entry ) {
            throw new Error(`No handler found for provider: ${provider.key}`);
        }

        return entry.handler;
    };

    return {
        registerSourceHandler,
        getHandlerForProvider,
        registerFallback
    }
}

export const sourceHandler = createSourceHandler();

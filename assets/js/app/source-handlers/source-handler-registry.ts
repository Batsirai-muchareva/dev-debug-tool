import { SourceHandler, SourceProvider, SourceProviderActions } from "../types";

const createSourceHandler = () => {
    const handlers = new Map<SourceProviderActions['type'], SourceHandler>();

    const register = (type: SourceProviderActions['type'], handler: SourceHandler) => {
        if ( handlers.has( type ) ) {
            console.warn(`Handler for type "${type}" already registered`);
            return;
        }

        handlers.set( type, handler );
    };

    const getHandlerForProvider = ( provider: SourceProvider ): SourceHandler => {
        const handler = handlers.get(provider.actions.type);

        if ( ! handler ) {
            const availableTypes = Array.from( handlers.keys() ).join( ', ' );

            throw new Error(
                `No handler registered for provider type: "${ provider.actions.type }". ` +
                `Available types: ${ availableTypes }`
            );
        }

        return handler;
    };

    return {
        register,
        getHandlerForProvider
    };
};

export const sourceHandler = createSourceHandler();

import * as React from "react";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "@wordpress/element";
import { CleanupFn, Data, UpdateSnapshotFn } from "../types";
import { sourceProviderRepository } from "../source-providers/source-provider-repository";
import { sourceHandler } from "../source-handlers/source-handler-registry";
import { createLifecycleManager } from "../lifecycle-manager";

export type SnapshotData = Record< string, {
    label: string;
    content: string | Data;
} >;

const SnapshotContext = createContext< { snapshot: SnapshotData } | undefined >( undefined );

export const SnapshotProvider = ( { children }: PropsWithChildren) => {
    const [snapshot, setSnapshot] = useState<SnapshotData>({});
    const cleanupFnsRef = useRef<Map<string, CleanupFn>>(new Map());

    const updateSnapshot = useCallback<UpdateSnapshotFn>((key, state) => {
        setSnapshot(prev => {
            const provider = sourceProviderRepository.getProvider(key);

            if ( ! provider ) {
                throw new Error( `No Provider found please define a provider for ${ key }` );
            }

            const content = state.status === 'success' ? state.data
                : state.status === 'idle' ? state.message
                : state.status === 'loading' ? 'Refreshing Data'
                : state.status === 'error' ? state.error
                : 'No Status';

            return {
                ...prev,
                [key]: {
                    label: provider.label,
                    content
                }
            };
        });
    }, [] );

    useEffect( () => {
        const providers = sourceProviderRepository.getProviders();

        providers.forEach( ( provider) => {
            // Get the appropriate handler
            const handler = sourceHandler.getHandlerForProvider(provider);

            // Create refetch function for lifecycle
            const refetch = () => {
                const newHandler = sourceHandler.getHandlerForProvider(provider);
                const cleanup = newHandler(provider, updateSnapshot);
                cleanupFnsRef.current.set( provider.key, cleanup );
            };

            // Setup main handler
            const handlerCleanup = handler(provider, updateSnapshot);

            // Setup lifecycle
            const lifecycleCleanup = createLifecycleManager(provider, refetch);

            // Combine cleanups
            cleanupFnsRef.current.set(provider.key, () => {
                handlerCleanup();
                lifecycleCleanup();
            });
        });

        return () => {
            cleanupFnsRef.current.forEach(cleanup => cleanup());
            cleanupFnsRef.current.clear();
        };
    }, [updateSnapshot]);

    const contextValue = useMemo(() => ({ snapshot }), [snapshot]);

    return (
        <SnapshotContext.Provider value={contextValue}>
            {children}
        </SnapshotContext.Provider>
    );
};

export const useSnapshot = () => {
    const context = useContext(SnapshotContext);

    if ( ! context ) {
        throw new Error("useSnapshot must be used within a SnapshotProvider");
    }
    return context;
};

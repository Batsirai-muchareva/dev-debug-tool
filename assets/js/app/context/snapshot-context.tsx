import * as React from "react";
import { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "@wordpress/element";
import { sourceProviderRepository } from "../source-providers/source-provider-repository";
import { SourceProvider } from "../source-providers/create-source-provider";

type ContentLabel = {
    label: string;
    content?: string | Record<string, any>;
};

export type SnapshotData = Record< string, ContentLabel >;

const SnapshotContext = createContext< { snapshot: SnapshotData } | undefined >( undefined );

export const SnapshotProvider = ({ children }: PropsWithChildren) => {
    const [ snapshot, setSnapshot ] = useState< SnapshotData >( {} );

    const updateSnapshot = ( id: string, updates: ContentLabel ) => {
        setSnapshot( prev => ( {
            ...prev,
            [id]: updates
        }));
    };

    const handleSubscriptionSource = ( provider: SourceProvider ) => {
        const subscribe = () => {
            provider.actions.subscribe?.( ( data ) => {
                updateSnapshot( provider.key, {
                    label: provider.label,
                    content: data,
                } )
            } );
        }

        // Set initial loading state
        if ( provider.actions.initializeListeners ) {
            provider.actions.initializeListeners( subscribe );
        }

        updateSnapshot(provider.key, {
            label: provider.label,
            content: 'data',
        });
    };

    const handlePromiseSource = async ( provider: SourceProvider ) => {
        try {
            const data = await provider.actions.get?.();

            updateSnapshot(provider.key, {
                label: provider.label,
                content: data,
            });
        } catch (error) {
            console.error(`Failed to load ${provider.key}:`, error);
            updateSnapshot(provider.key, {
                label: provider.label,
                content: { error: error instanceof Error ? error.message : 'Failed to load' },
            });
        }
    };

    const initialise = () => {
        sourceProviderRepository.getProviders().forEach( async ( provider ) => {
            if ( provider.actions.subscribe ) {
                return handleSubscriptionSource( provider );
            }

            if ( provider.actions.get ) {
                return await handlePromiseSource( provider );
            }
        } );
    };

    useEffect( () => {
        initialise();
    }, [] )

    return (
        <SnapshotContext.Provider value={ { snapshot } }>
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

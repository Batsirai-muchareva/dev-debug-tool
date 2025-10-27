import * as React from 'react';
import { SlotFillProvider } from '@wordpress/components';

import { PopoverProvider } from "./context/popover-context";
import { SnapshotProvider } from "./context/snapshot-context";
import { DebugButton } from "./components/debug-button";
import { sourceProviderRepository } from "./source-providers/source-provider-repository";
import { databaseSource } from "./source-providers/database-source-provider";
import { editorSourceProvider } from "./source-providers/editor-source-provider";

export const App = () => {
    return (
        <SlotFillProvider>
            <SnapshotProvider>
                <PopoverProvider>
                    <DebugButton />
                    <Initializer />
                </PopoverProvider>
            </SnapshotProvider>
        </SlotFillProvider>
    );
}

const Initializer = () => {
    sourceProviderRepository.register( databaseSource )
    sourceProviderRepository.register( editorSourceProvider );

    return null
}

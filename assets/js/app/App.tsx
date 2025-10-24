import * as React from 'react';
import { SlotFillProvider } from '@wordpress/components';

import { SettingsProvider } from "./context/settings-context";
import { PopoverProvider, usePopover } from "./context/popover-context";
import { SnapshotProvider } from "./context/snapshot-context";
import { FloatingActionButton } from "./components/floating-action-button";


export const App = () => {

    return (
        <SlotFillProvider>
            <SettingsProvider>
                <PopoverProvider>
                    <SnapshotProvider>
                       <DebugButton />
                    </SnapshotProvider>
                </PopoverProvider>
            </SettingsProvider>
        </SlotFillProvider>
    );
}

const DebugButton = () => {
    const popover = usePopover();

    return <FloatingActionButton onClick={ popover.toggle } />
}

import * as React from 'react';
import { SlotFillProvider } from '@wordpress/components';

import { PopoverProvider } from "./context/popover-context";
import { SnapshotProvider } from "./context/snapshot-context";
import { FloatingButton } from "./components/floating-button";
import { initSourceProvider } from "./source-providers/init";
import { initSourceHandlers } from "./source-handlers/init";
import { Popover } from "./components/popover";
import { PositionProvider } from "./context/position-context";
import { initActions } from "./actions/init";

// We might not need the slot fill provider
export const App = () => {
    initSourceProvider();
    initSourceHandlers();
    initActions();

    return (
        <SlotFillProvider>
            <PositionProvider>
                <SnapshotProvider>
                    <PopoverProvider>
                        <FloatingButton />
                        <Popover />
                    </PopoverProvider>
                </SnapshotProvider>
            </PositionProvider>
        </SlotFillProvider>
    );
}

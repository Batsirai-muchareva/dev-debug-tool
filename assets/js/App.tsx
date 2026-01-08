import * as React from 'react';
import { SlotFillProvider } from "@wordpress/components";

import { PositionTracker } from "@app/position-tracker";
import { BoundsProvider } from "@app/context/bounds-context";
import { PopoverProvider } from "@app/context/popover-context";

import { registerSuggestionValueTypes } from "@app/suggestions/register-value-types";
import { Shell } from "./shell";
import { ToggleButton } from "@component/toggle-button/toggle-button";
import { Notification } from "@libs/notification/notification";
import { registerDataSources } from "@app/source-manager";
import { registerActions } from "@app/actions";

registerSuggestionValueTypes();
registerDataSources();
registerActions();

export const App = () => {
    return (
        <SlotFillProvider>
            <PopoverProvider>
                <BoundsProvider>
                    <ToggleButton />
                    <PositionTracker />
                    <Shell />
                    <Notification />
                </BoundsProvider>
            </PopoverProvider>
        </SlotFillProvider>
    );
}

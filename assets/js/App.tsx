import * as React from 'react';
import { SlotFillProvider } from "@wordpress/components";

import { PositionTracker } from "@app/position-tracker";
import { BoundsProvider } from "@app/context/bounds-context";
import { PopoverProvider } from "@app/context/popover-context";

import { registerActions } from "@app/actions-registry/init";
import { registerSuggestionValueTypes } from "@app/suggestions/register-value-types";
import { Shell } from "./shell";
import { ToggleButton } from "@component/toggle-button/toggle-button";
import { Notification } from "@libs/notification/notification";
import { registerDataProviders } from "@app/data-source-manager/register-data-providers";

registerSuggestionValueTypes();
registerDataProviders();
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

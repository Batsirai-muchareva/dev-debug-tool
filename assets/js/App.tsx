import * as React from 'react';
import { SlotFillProvider } from "@wordpress/components";

import { PositionTracker } from "@app/position-tracker";
import { BoundsProvider } from "@app/context/bounds-context";
import { PopoverProvider } from "@app/context/popover-context";

import { registerDataProviders } from "@app/manager/register-data-providers";
import { registerActions } from "@app/actions-registry/init";
import { registerSuggestionValueTypes } from "@app/suggestions/register-value-types";
import { Panel } from "./Panel";
import { ToggleButton } from "@component/toggle-button/toggle-button";
import { Notification } from "@libs/notification/notification";

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
                    <Panel />
                    <Notification />
                </BoundsProvider>
            </PopoverProvider>
        </SlotFillProvider>
    );
}

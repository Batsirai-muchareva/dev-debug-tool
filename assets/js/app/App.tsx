import * as React from 'react';

import { PopoverProvider } from "./context/popover-context";
import { SnapshotProvider } from "./context/snapshot-context";
import { TabsProvider } from "./context/tabs-context";
import { FloatingButton, POSITION_TRACKER_SLOT_ID } from "./components/floating-button";
import { initSourceProvider } from "./source-providers/init";
import { initSourceHandlers } from "./source-handlers/init";
import { Popover } from "./components/popover";
import { NotificationComponent } from "./components/notification";
import { BoundsProvider } from "./context/bounds-context";
import { initActions } from "./actions/init";
import { Fill, SlotFillProvider } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { dispatchCustomEvent, listenTo, listenToElement, POPOVER_OPEN_EVENT, WINDOW_RESIZE_EVENT } from "./events";
import { useCallback } from "react";

export const App = () => {
    initSourceProvider();
    initSourceHandlers();
    initActions();

    return (
        <SlotFillProvider>
            <PopoverProvider>
                <BoundsProvider>
                    <SnapshotProvider>
                        <TabsProvider>
                            <FloatingButton />
                            <Popover />
                            <NotificationComponent />
                            <PositionControlFill />
                        </TabsProvider>
                    </SnapshotProvider>
                </BoundsProvider>
            </PopoverProvider>
        </SlotFillProvider>
    );
}

function PositionControlFill() {
    const [ node, setNode ] = useState<HTMLElement | null>(null);

    useEffect( () => {
        if ( node ) {
            listenToWindowResize();
            listenToClickEvent();
        }
    }, [ node ] );

    const callbackRef = useCallback( ( element: HTMLElement | null ) => {
        setNode( element?.parentElement ?? null );
    }, [] );

    const listenToWindowResize = () => {
        listenTo( 'resize', () => dispatchEvent( WINDOW_RESIZE_EVENT ) );
    }

    const listenToClickEvent = () => {
        listenToElement( node as HTMLElement, 'click', () => {
            requestAnimationFrame( () => {
                dispatchEvent( POPOVER_OPEN_EVENT )
            } )
        });
    }

    const dispatchEvent = ( event: string ) => {
        dispatchCustomEvent( event, {
            detail: {
                left: node?.offsetLeft,
                top: node?.offsetTop,
            }
        } );
    }

    return (
        <Fill name={ POSITION_TRACKER_SLOT_ID }>
            <span ref={ callbackRef }/>
        </Fill>
    );
}

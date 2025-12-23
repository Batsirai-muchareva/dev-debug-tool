import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { Box } from "@component/ui/box";
import { listenToEvent } from "@app/events/listeners/listen-to-event";
import { RESIZE_POPOVER_EVENT } from "@app/events/event-lists";

type Props = {
    index: number;
    tabCount: number;
    className: string;
};

export const Indicator = forwardRef<HTMLDivElement, Props>( ( { index, tabCount, className }, ref ) => {
    const [ width, setWidth ] = useState(0);

    const calculateSize = useCallback( () => {
        if ( ! ref || typeof ref === "function" || ! ref.current || tabCount === 0 ) {
            return;
        }

        const element = ref.current;

        const elementWidth = element?.clientWidth;

        setWidth( elementWidth / tabCount );
    }, [] );


    useEffect( () => {
        return listenToEvent( RESIZE_POPOVER_EVENT, calculateSize );
    }, [ calculateSize ] );

    useEffect( () => {
        requestAnimationFrame(() => {
            calculateSize()
        } );
    }, [] );

    const styles = {
        width: width,
        transform: `translateX(${ index * width }px)`
    };

    return (
        <Box style={ styles } className={ className } />
    )
} );

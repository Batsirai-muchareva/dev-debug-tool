import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { Box } from "@component/ui/box";
import { useEventBus } from "@app/hooks/use-event-bus";

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


    useEventBus( 'window:mousemove', calculateSize );

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

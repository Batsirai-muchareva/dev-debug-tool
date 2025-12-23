import { useBounds } from "../context/bounds-context";
import { useLayoutEffect, useState } from "react";
import { useRef } from "@wordpress/element";

export const useStyle = ( anchor?: HTMLElement | null, width?: number, side = 'left' ) => {
    const { position, setPosition, size, setSize } = useBounds();
    const [ anchorStyle, setAnchorStyle ] = useState( { top: 0, left: 0 } );
    const popoverRef = useRef<HTMLDivElement | null>(null);

    const isAnchored = !!anchor;

    useLayoutEffect(() => {
        if (!anchor || !popoverRef.current) return;

        const rect = anchor.getBoundingClientRect();
        const popRect = popoverRef.current.getBoundingClientRect();

        let top = rect.bottom + window.scrollY;
        let left = rect.left + window.scrollX;

        if (side === "left") {
            top = rect.top + window.scrollY;
            left = rect.left - popRect.width + window.scrollX;
        }

        if (side === "right") {
            top = rect.top + window.scrollY;
            left = rect.right + window.scrollX;
        }

        if (side === "top") {
            top = rect.top - popRect.height + window.scrollY;
            left = rect.left + window.scrollX;
        }

        if (side === "bottom") {
            top = rect.bottom + window.scrollY;
            left = rect.left + window.scrollX;
        }

        setAnchorStyle({ top, left });
    }, [anchor, side]);

    // useLayoutEffect( () => {
    //     if ( isAnchored ) {
    //         const rect = anchor.getBoundingClientRect();
    //
    //         setAnchorStyle({
    //             top: rect.bottom + window.scrollY,
    //             left: rect.left + window.scrollX
    //         });
    //     }
    // }, [anchor]);

    // Return anchor positioning if anchor exists
    //
    if ( isAnchored ) {
        return {
            styles: {
                top: anchorStyle.top,
                left: anchorStyle.left,
                width: width ?? 300
            },
            ref: popoverRef
        };
    }

    return {
        styles: {
            width: size.width,
            height: size.height,
            left: position.x,
            top: position.y,
        },
        ref: popoverRef
    };
}

import React, { PropsWithChildren } from "react";
import { bemBlock } from "@app/utils/bem";
import { Button } from "@component/ui/button";

export type TabProps = PropsWithChildren & {
    active?: boolean;
    onClick: () => void;
    label: string;
    variant?: string;
};

export const Tab = ( { active, label, onClick, variant, children }: TabProps ) => {
    if ( ! variant ) {
        throw Error( 'Variant is required' );
    }

    return (
        <Button
            className={ bemBlock.condElemMod( variant ?? '', 'active', active ?? false ) }
            onClick={ onClick }
        >
            { label }
            { children }
        </Button>
    )
}

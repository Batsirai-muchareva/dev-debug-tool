import * as React from "react";

type TabHeader = {
    label: string;
    onClick: () => void;
    isActive: boolean;
}

export const TabHeader = ( { label, onClick, isActive }: TabHeader ) => (
    <button
        onClick={ () => onClick() }
        className={`dev-debug__tab ${ isActive ? 'active' : '' }`}
    >
        { label }
    </button>
)

import React from "react";

type Props = {
    className: string;
    onMouseDown: React.MouseEventHandler<HTMLDivElement>;
};

export const ResizeBarHandle = ( { className, onMouseDown }: Props ) => {
    return (
        <div
            className={`dev-debug-resizable__handle ${ className }`}
            onMouseDown={ onMouseDown }
        />
    );
};

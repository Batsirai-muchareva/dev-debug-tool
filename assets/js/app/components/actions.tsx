import React from "react"
import { actionsRegistry } from "../actions/actions-registry";
import { useSnapshot } from "../context/snapshot-context";
import { useTabs } from "../context/tabs-context";

export const Actions = () => {
    const registeredActions = actionsRegistry.getActions();
    const snapshot = useSnapshot()
    const { activeKey } = useTabs()

    return (
        <div className="dev-debug-actions">
            {
                registeredActions.map( ( action ) => (
                    <button
                        key={ action.id }
                        onClick={ () => action.onClick( snapshot.snapshot, activeKey ) }
                        className={ action.className }
                    >
                        <i className={ action.icon }></i>
                        { action.title }
                    </button>
                ) )
            }
        </div>
    )
}

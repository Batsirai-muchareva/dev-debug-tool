import React from "react"
import { actionsRegistry } from "../actions/actions-registry";
import { useSnapshotBind } from "../context/snapshot-bind-context";
import { Data } from "../types";

export const Actions = () => {
    const registeredActions = actionsRegistry.getActions();
    const { filteredContent, bind } = useSnapshotBind();

    return (
        <div className="dev-debug-actions">
            {
                registeredActions.map( ( action ) => (
                    <button
                        key={ action.id }
                        onClick={ () => action?.onClick?.( filteredContent as Data, bind ) }
                        className={ action.className + ' dev-debug__action' }
                    >
                        { action.icon
                            ? ( <i className={ action.icon }></i> )
                            : ( <action.component onClick /> )
                        }

                        { action.title }
                    </button>
                ) )
            }
        </div>
    )
}

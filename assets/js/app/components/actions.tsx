import React from "react"
import { actionsRegistry } from "../actions/actions-registry";

export const Actions = () => {
    const registeredActions = actionsRegistry.getActions();

    return (
        <div className="dev-debug-actions">
            {
                registeredActions.map( ( { id, title, icon, onClick, className } ) => (
                    <button key={ id } onClick={ onClick } className={ className }>
                        <i className={ icon }></i>
                        { title }
                    </button>
                ) )
            }
        </div>
    )
}

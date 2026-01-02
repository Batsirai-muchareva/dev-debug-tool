import React from "react"
import { actionsRegistry } from "@app/actions-registry/actions-registry";
import { useFilteredData } from "@app/context/filter-context";
import { useTabs } from "@app/context/tabs/tabs-context";

export const Actions = ( { disabled }: { disabled: boolean } ) => {
    const registeredActions = actionsRegistry.getActions();
    const { data } = useFilteredData();
    const { activeTab } = useTabs();

    return (
        <div className="dev-debug-actions">
            {
                registeredActions.map( ( action: any ) => (
                    <button
                        style={ { opacity: disabled ? '50%' : '100%', cursor: disabled ? 'not-allowed' : 'pointer' } }
                        key={ action.id }
                        onClick={ () => ! disabled && action.onClick( data, activeTab ) }
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

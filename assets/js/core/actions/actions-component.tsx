import React from "react"
import { useTabs } from "@app/context/tabs/tabs-context";
import { useResolvedData } from "@app/context/data/resolved-data-context";
import { bemBlock } from "@app/utils/bem";
import { actionsRegistry } from "@app/actions/index";

export const ActionsComponent = () => {
    const registeredActions = actionsRegistry.getActions();
    const { data, hasNoData } = useResolvedData();
    const { activeProvider } = useTabs();

    const disabled = hasNoData;

    return (
        <div style={ { display: 'flex', gap: '8px' } } className={ bemBlock.element( 'actions' ) }>
            {
                registeredActions.map( ( action: any ) => (
                    <button
                        style={ { opacity: disabled ? '50%' : '100%', cursor: disabled ? 'not-allowed' : 'pointer' } }
                        key={ action.id }
                        onClick={ () => ! disabled && action.onClick( data, activeProvider ) }
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

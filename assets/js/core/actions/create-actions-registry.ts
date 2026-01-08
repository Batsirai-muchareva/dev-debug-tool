export type ActionConfig = {
    id: string;
    icon?: string;
    title?: string;
    className: string;
    component?: any;
    onClick?: ( snapshot: any, bind: string ) => void;
}

export const createActionsRegistry = () => {
    const actions: Record<string, ActionConfig> = {}

    const registerAction = ( action: ActionConfig ) => {
        actions[ action.id ] = action;
    }

    const getActions = () => {
      return Object.values( actions );
    }

    return {
        registerAction,
        getActions
    }
}

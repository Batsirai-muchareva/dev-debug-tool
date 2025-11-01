import { SnapshotData } from "../context/snapshot-context";

export type ActionConfig = {
    id: string;
    icon: string;
    title: string;
    className: string;
    onClick: ( snapshot: SnapshotData, activeKey: string ) => void;
}

const createActionsRegistry = () => {
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

export const actionsRegistry = createActionsRegistry();

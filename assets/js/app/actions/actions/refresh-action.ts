import { ActionConfig } from "../actions-registry";

export const refreshAction: ActionConfig = {
    id: 'refresh',
    title: 'Refresh',
    icon: 'eicon-sync',
    className: 'dev-debug-refresh',
    onClick: () => {
        // get the current active source provider
    }
}

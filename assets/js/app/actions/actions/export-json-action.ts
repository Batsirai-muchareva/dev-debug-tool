import { ActionConfig } from "../actions-registry";

export const exportJsonAction: ActionConfig = {
    id: 'export-json',
    title: 'Export JSON',
    icon: 'eicon-copy',
    className: 'dev-debug-export',
    onClick: () => {
        // get the current active source provider
    }
}

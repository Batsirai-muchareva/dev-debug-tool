import { copyAction } from "./actions/copy-action";
import { exportJsonAction } from "./actions/export-json-action";
import { createActionsRegistry } from "./create-actions-registry";

export const actionsRegistry = createActionsRegistry();

export function registerActions() {
    actionsRegistry.registerAction( copyAction );
    actionsRegistry.registerAction( exportJsonAction );
}

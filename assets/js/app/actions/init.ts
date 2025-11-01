import { actionsRegistry } from "./actions-registry";
import { refreshAction } from "./actions/refresh-action";
import { createCopyAction } from "./actions/copy-action";
import { exportJsonAction } from "./actions/export-json-action";

export function initActions() {
    actionsRegistry.registerAction( refreshAction );
    actionsRegistry.registerAction( createCopyAction );
    actionsRegistry.registerAction( exportJsonAction );
}

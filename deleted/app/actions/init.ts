import { actionsRegistry } from "./actions-registry";
import { copyAction } from "./actions/copy-action";
import { exportJsonAction } from "./actions/export-json-action";
import { followUpdatesAction } from "./actions/follow-updates";

export function initActions() {
    actionsRegistry.registerAction( copyAction );
    actionsRegistry.registerAction( exportJsonAction );
    actionsRegistry.registerAction( followUpdatesAction );
}

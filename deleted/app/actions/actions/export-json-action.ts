import { ActionConfig } from "../actions-registry";
import { SnapshotData } from "../../context/snapshot-context";
import { showNotification } from "../../libs/notification/notifications";

export const exportJsonAction: ActionConfig = {
    id: 'export-json',
    title: 'Export',
    icon: 'eicon-copy',
    className: 'dev-debug-export',
    onClick: async ( content, bind ) => {

        if ( ! content ) {
            showNotification( 'No content to copy', 'error' );
            return;
        }

        try {
            const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${bind}-schema-${Date.now()}.json`;
            document.body.appendChild(a);

            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            showNotification( 'Export failed: ' +  (error as any).message, 'error');
        }
        // get the current active source provider
    }
}

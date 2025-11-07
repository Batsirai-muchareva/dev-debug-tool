import { SnapshotData } from "../../context/snapshot-context";
import { showNotification } from "../../libs/notification/notifications";
import { ActionConfig } from "../actions-registry";

export const copyAction: ActionConfig = {
    id: 'copy',
    title: 'Copy',
    icon: 'eicon-copy',
    className: 'dev-debug-copy',
    onClick: async ( snapShot: SnapshotData, activeKey: string ) => {
        const { content } = snapShot[activeKey];

        if ( ! content ) {
            showNotification( 'No content to copy', 'error' );
            return;
        }

        try {
            const textToCopy = JSON.stringify( content, null, 2 );

            if ( navigator.clipboard && navigator.clipboard.writeText ) {
                await navigator.clipboard.writeText( textToCopy );
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            showNotification( 'Copied to clipboard!', 'success' );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showNotification( `Copy failed: ${errorMessage}`, 'error' );
        }
    }
}

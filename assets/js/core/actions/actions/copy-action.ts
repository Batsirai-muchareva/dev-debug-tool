import { ActionConfig } from "../create-actions-registry";
import { showNotification } from "@libs/notification";

export const copyAction: ActionConfig = {
    id: 'copy',
    title: 'Copy',
    icon: 'eicon-copy',
    className: 'dev-debug-copy',
    onClick: async ( content ) => {
        if ( ! content ) {
            // showNotification( 'No content to copy', 'error' );
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

            showNotification( 'Copied to clipboard!' );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            // showNotification( `Copy failed: ${errorMessage}`, 'error' );
        }
    }
}

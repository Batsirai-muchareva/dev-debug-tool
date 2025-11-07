import { httpApi } from "../../api/http-api";
import { getPostId } from "../../sync/post-id";
import { getSettings } from "../../sync/get-settings";
import { subscribeToCommand } from "../../sync/subscribe-to-command";
import { SourceProvider } from "../../types";

export const databaseSourceProvider: SourceProvider = {
    key: 'database',
    label: 'Database',
    actions: {
        type: 'promise',
        fetch: async () => {
            const http = httpApi();
            const postId = getPostId();
            const { databaseAjaxAction, nonce } = getSettings();

            const params = new URLSearchParams( {
                action: databaseAjaxAction,
                post_id: postId.toString(),
                nonce: nonce
            } );

            const response = await http.post( '', params );

            if ( response.data.success ) {
                return response.data.data.schema
            } else {
                throw new Error( response.data.data?.message || 'Failed to fetch schema' );
            }
        },
    },
    lifecycle: {
        onMount: ( refetch ) => {
            return subscribeToCommand('run:after', ( _, command) => {
                if ( command === 'document/save/update' ) {
                    refetch();
                }
            });
        },
    }
};

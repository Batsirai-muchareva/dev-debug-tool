import { createSourceProvider } from "./create-source-provider";
import { httpApi } from "../api/http-api";
import { getPostId } from "../sync/post-id";
import { getSettings } from "../sync/get-settings";

export const DATABASE_SOURCE_KEY = 'database';

/* Subscription pattern (editor) */
export const databaseSource = createSourceProvider( {
    key: 'database',
    label: 'Database',
    canGetData: () => true, // Always ready
    priority: 10,
    actions: {
        get: () => {
            const http = httpApi();
            const postId = getPostId();
            const { databaseAjaxAction, nonce } = getSettings();

            const params = new URLSearchParams( {
                action: databaseAjaxAction,
                post_id: postId.toString(),
                nonce: nonce
            } );

            async function fetchData() {
                const response = await http.post('', params);

                if ( response.data.success ) {
                    return response.data.data.schema
                } else {
                    throw new Error( response.data.data?.message || 'Failed to fetch schema' );
                }
            }

            return fetchData();
        }
    }
} );

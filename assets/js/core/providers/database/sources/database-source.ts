import { wordPressAdapter } from "@app/adapters";
import { getSettings } from "@app/sync/get-settings";
import { DatabaseData, SourceConfig } from "@app/providers/database/types";
import { DataSourceFactory, Notify, Unsubscribe } from "@app/types";

export const createDatabaseSource: DataSourceFactory< DatabaseData, SourceConfig > = ( config ) => {
    let notify: Notify<DatabaseData> | null = null;
    let unsubscribeSave: Unsubscribe | null = null;
    let isFetching = false;

    const { databaseAjaxAction } = getSettings();
    const { metaKey, postId } = config;

    const fetchData = async () => {
        if ( isFetching ) {
            console.debug( '[DatabaseSource] Fetch already in progress, skipping' );

            return;
        }

        isFetching = true;

        // Signal loading
        notify?.( null );

        try {
            const result = await wordPressAdapter.fetch( databaseAjaxAction, {
                meta_key: metaKey,
                post_id: postId,
            } )

            if ( result.success ) {
                notify?.(
                    result.data as any
                    // {
                    // schema: ,
                    // postId: String( postId ),
                    // metaKey,
                 )
            }

        } catch ( e ) {
            notify?.(null);
        } finally {
            isFetching = false;
        }
    };

    return {
        start: async ( notifyFn: Notify<DatabaseData> ) => {
            notify = notifyFn;

            await fetchData();


        },
        stop: () => {
            unsubscribeSave?.();
            unsubscribeSave = null;
            notify = null;
            isFetching = false;
        },
        refresh: async () => {
            await fetchData();
        },
    }
}

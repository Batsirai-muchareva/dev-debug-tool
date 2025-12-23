import { getPostId } from "@app/sync/post-id";
import { getSettings } from "@app/sync/get-settings";
import { http } from "@app/providers/database-provider/http";
import { Callback, DataProvider } from "@app/types";
import { createElementorEventSubscriber } from "@app/events/subscribers/create-elementor-event-subscriber";
import { listenToEvent } from "@app/events/listeners/listen-to-event";
import { DataGetEvent } from "@app/events/event-lists";
import { wordPressAdapter } from "@app/adapters";

const ID = 'database';

const databaseSubscriber = createElementorEventSubscriber();

type Getter = ( metaKey?: string, postId?: string ) => Promise<any>;

type Variants = Record<string, {
    metaKey: string;
    postId: string;
    label: string;
}>

const createFetchTrigger = ( cb: Callback, get: Getter ) => {
    return async ( metaKey?: string, postId?: string) => {
        cb( null ); // loading
        cb( await get( metaKey, postId ) );
    };
};

export function databaseProvider(): DataProvider {
    const { databaseAjaxAction } = getSettings();
    const variants = buildVariantsConfig();

    const get = async ( metaKey?: string, postId?: string ) => {
        await wordPressAdapter.fetch( databaseAjaxAction, {
            meta_key: metaKey ?? variants.post.metaKey,
            post_id: postId ?? variants.post.postId,
        } );
        //
        // const params = new URLSearchParams( {
        //     action,
        //     post_id: postId ?? variants.post.postId,
        //     meta_key: metaKey ?? variants.post.metaKey,
        //     nonce,
        // } );
        //
        // const response = await api.post( '', params );
        //
        // if ( response.data.success ) {
        //     return response.data.data.schema
        // }
        //
        // throw new Error(
        //     response.data.data?.message || 'Failed to fetch schema'
        // );
    }

    const subscribe = ( cb: Callback ) => { // pass variant active variant
        const triggerFetch = createFetchTrigger( cb, get );
        const events = Object.keys( variants ).map( ( key ) => DataGetEvent( ID, key ) );

        databaseSubscriber.subscribe( 'document/save/update', async () => await triggerFetch() );

        const unsubscribeRefetch = listenToEvent<{ id: string }>(
            events,
            async ( { detail } ) => {
                const variant = variants[ detail.id ];

                await triggerFetch( variant.metaKey, variant.postId );
            }
        );

        return () => {
            databaseSubscriber.unsubscribeAll();
            unsubscribeRefetch()
        }
    }

    return {
        get,
        subscribe,
        id: ID,
        title: 'Database',
        getMessage: ( data ) => {
            if ( Array.isArray( data ) && data.length === 0 ) {
                return "Database is empty — publish something to populate the database";
            }

            return 'Refreshing...'
        },
        shouldShowData: ( data ) => {
            return Array.isArray( data ) && data.length !== 0 ||
                Object.keys( data ?? {} ).length > 0
        },
        variants,
    }
}

function buildVariantsConfig(): Variants {
    const { metaKeys, kitId } = getSettings();

    return {
        post: {
            label: 'Post',
            metaKey: metaKeys.post,
            postId: getPostId(),
        },
        variables: {
            label: 'Variables',
            metaKey: metaKeys.variables,
            postId: kitId,
        },
        global_classes: {
            label: 'Classes',
            metaKey: metaKeys.global_classes,
            postId: kitId,
        }
    };
}











// Why get() is mostly unused in reactive editor
// The provider calls your callback whenever the element becomes available or updates.
// The UI doesn’t need to call get() manually.
// Element may not exist initially
// get() would return null at first anyway.
// The real data only comes later through the subscription when the element is available.
// All updates flow through subscribe:

// const unsubscribeSave = databaseSubscriber.subscribe(
//     "document/save/update",
//     () => triggerFetch()
// );

// const triggerDataFetch = async ( metaKey: string, postId: string ) => {
//     cb( null ); // Trigger loading refreshing status
//     cb( await get( metaKey, postId ) );
// };

// should be listen/ subscribe to elementor commands / events to be clear

// const listener = listenToEvent( 'database/refetch', async ( event ) => {
//     const details = ( event as any ).detail;
//
//     await triggerDataFetch( details.meta_key, details.post_id );
// } );

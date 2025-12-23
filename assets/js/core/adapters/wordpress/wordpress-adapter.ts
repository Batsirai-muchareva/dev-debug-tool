import { http } from "@app/adapters/wordpress/http";
import { createError } from "@app/adapters/wordpress/create-error";


const isHttpError = ( error: unknown ) =>
    typeof error === "object" &&
    error !== null &&
    'status' in error &&
    'message' in error;

const createWordPressAdapter = () => {
    const api = http();

    return {
        fetch: async ( action: string, { post_id, meta_key }: { post_id: string; meta_key: string } ) => {
            try {
                const params = new URLSearchParams( {
                    action,
                    post_id,
                    meta_key,
                } );

                const response = await api.post(  params );

                if ( response.data.success ) {
                    return response.data.data.schema
                }
            } catch ( e ) {
                if ( isHttpError( e ) ) {
                    return {
                        success: false,
                        error: createError(
                            e.status as number,
                            e.message as string
                        )
                    }
                }
            }
        }
    }
}

export const wordPressAdapter = createWordPressAdapter()

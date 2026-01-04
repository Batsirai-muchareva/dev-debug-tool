import { DataSourceFactory, Notify } from "@app/types";

type SourceEffects<T> = {
    setup?: () => void;
    teardown?: () => void;
    refresh?: () => Promise<void> | void;
};

type SourceFn<T, C> = (
    notify: Notify<T>,
    config: C,
) => SourceEffects<T>;

export const createSource =
    <T, C = void>( sourceFn: SourceFn<T, C> ): DataSourceFactory<T, C> => {

    return ( config: C ) => {
        let notify: Notify<T> | null = null;
        let effects: SourceEffects<T> | null = null;

        return {
            start( notifyFn: Notify<T> ) {
                if ( effects ) {
                    return;
                }

                notify = notifyFn;

                effects = sourceFn( ( data: T | null ) => {
                    notify?.( data );
                }, config );

                effects.setup?.();
            },

            stop() {
                effects?.teardown?.();

                effects = null;
                notify = null;
            },
            //
            // async refresh() {
            //     await effects?.refresh?.();
            // },
        };
    };
}



// export const createSource = <T>( sourceFn: SourceFn<T> ): DataSourceFactory => {
//     let notify: Notify<T> | null = null;
//     let effects: SourceEffects | null = null;
//
//     return {
//         start( notifyFn: Notify<T> ) {
//             if ( effects ) {
//                 return;
//             }
//
//             notify = notifyFn;
//             effects = sourceFn( ( data: T | null ) => notify?.( data ) );
//             effects.setup?.();
//         },
//
//         stop() {
//             effects?.teardown?.();
//             effects = null;
//             notify = null;
//         },
//     };
// };


// import type { Notify } from "@app/types";

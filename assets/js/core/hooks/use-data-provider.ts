import { useEffect, useState } from "react";
import { DataProvider, UnknownData } from "@app/types";
import { dataProviderManager } from "@app/manager/register-data-providers";
import { useTabs } from "@app/context/tabs/tabs-context";

type State = Record< DataProvider['id'], UnknownData >;

export function useDataProvider() {
    const { activeTab } = useTabs();
    const [ data, setData ] = useState<State>({});

    const updateData = ( id: DataProvider['id'], data: UnknownData ) => {
        setData( ( prev: any ) => ( {
            ...prev,
            [ id ]: data
        } ) );
    }

    useEffect( () => {
        const cleanups: Array<() => void> = [];

        dataProviderManager.getAllProviders().forEach( async ( provider ) => {
            const data = provider.get ? await provider.get() : null;
            // get should be initialise to make sense

            updateData( provider.id, data )

            const unsubscribe = provider.subscribe( ( data ) => {
                updateData( provider.id, data )
            } );

            cleanups.push( unsubscribe );
        } )

        return () => {
            cleanups.forEach( fn => fn() );
        };
    }, [] );

    return data[ activeTab ];
}
















// export function useDataSource() {
//     // key or bind to get current
//     const sources = dataSourceManager.getAllSources();
//     // i just want to say get data and get data for async and get initial data for subscribption and somehow the subscribe has to be called
//     // maybe lifecycle should call the sources because we have situation that the subscription has 2 subscriptions
//     // 1 which is listening to slected element and another listen to the selected element model
//
//     // / async database has also event listener for when saved changes are perform and notify of the changes
//     console.log(  )
// }


// const unsubscribe = listenTo( 'refetching-data', ( event: any ) => {
//     const sourceId = event.detail?.sourceId || activeSource;
//     setSourceLoading( sourceId, true );
// } );

// lifecycle.on('beforeStart', ( allSources ) => {
//     // const initialLoadingStates: Record<string, boolean> = {};
//     //
//     // allSources.forEach( (source: any) => {
//     //     initialLoadingStates[source.id] = true;
//     // });
//     //
//     // setLoadingStates(initialLoadingStates);
//
// } );
//
// lifecycle.on('beforeDataEmit', ( payload ) => {
//     if ( ! payload.data ) {
//         setLoadingStates(prev => ( { ...prev, [ payload.id ]: true } ) );
//     } else {
//         setLoadingStates(prev => ( { ...prev, [ payload.id ]: false } ) );
//     }
//
//
//     // setSourceLoading( payload.id, false );
//
//     //
//     // if ( ! payload.data || payload.data.length === 0 ) {
//     //     setLoading( true )
//     // }
//
//     payload.batsirai = '999999';
//
//     // console.log('Successfully started!', payload );
//     // Hide loading spinner
//     // filtering here
// });
//
// lifecycle.on('onDataEmit', ( payload ) => {
//     // Hide loading spinner
//
//     // console.log('asfasf', payload );
//         setSources( ( prev: any ) => ( {
//             ...prev,
//             [ payload.id ]: { ...payload.data }
//         } ) );
// } );
//
// lifecycle.start();
//

// lifecycle.on('afterStart', () => {
//     console.log('Successfully started!');
//     // Hide loading spinner
// });
//
// lifecycle.on('onError', (error) => {
//     console.error('Error occurred:', error);
//     // Show error notification
// });
//
// lifecycle.on('beforeCleanup', () => {
//     console.log('About to cleanup...');
//     // Save state before cleanup
// });
//
// lifecycle.on('afterCleanup', () => {
//     console.log('Cleanup complete!');
//     // Reset UI state
// });
// const lifecycle = createDataSourceLifecycle( dataSourceManager );


// lifecycleRef.current.start();
// lifecycleRef.current.hooks.onbefore;
// return () => lifecycleRef.current.cleanup();
// return () => {
//     // unsubscribe();
//     lifecycle.cleanup();
// };
// const setSourceLoading = (sourceId: string, isLoading: boolean) => {
//     // setLoadingStates(prev => ({ ...prev, [sourceId]: isLoading }));
// };

// keep the ref always updated
// useEffect(() => {
//     loadingRef.current = loading;
// }, [loading]);
//
// React.useEffect(() => {
//     provider.get().then(setData);        // initial fetch
//     provider.subscribe(setData);         // subscribe to updates
//
//     return () => provider.unsubscribe(setData); // cleanup
// }, [provider]);

// async function useData(provider: DataProvider) {
//     // Pull-based
//     const data = provider.get ? await provider.get() : null;
//
//     // Push-based
//     let unsubscribe: (() => void) | undefined;
//     if (provider.subscribe) {
//         unsubscribe = provider.subscribe(newData => {
//             console.log("Reactive update:", newData);
//         });
//     }
//
//     return () => unsubscribe?.();
// }

// function useReactiveEditor(provider: ReactiveDataProvider) {
//   const [data, setData] = React.useState<any>(null);
//
//   React.useEffect(() => {
//     let unsub: (() => void) | undefined;
//
//     provider.get().then(setData);       // initial fetch
//     unsub = provider.subscribe(setData); // subscribe to live updates
//
//     return () => unsub?.();             // cleanup
//   }, [provider]);
//
//   return data;
// }


// instead of sennding data we can send hooks and component will deal which one is better

// // Get loading state for the active source
// const isActiveSourceLoading = loadingStates[activeSource] ?? true;
//
// // Get data for the active source
// const activeSourceData = sources[activeSource];



// function useDataSource() {
//   const [data, setData] = useState(null);
//
//   useEffect(() => {
//     // Start lifecycle
//     const lifecycle = createDataSourceLifecycle(manager);
//
//     const unsubscribe = lifecycle.onData((payload) => {
//       setData(payload);
//     });
//
//     lifecycle.start();
//
//     // Cleanup
//     return () => {
//       unsubscribe();
//       lifecycle.cleanup();
//     };
//   }, []);
//
//   return data;
// }
// const unsubscribe = lifecycleRef.current.onData( ( payload: any ) => {
//     setSources( ( prev: any ) => ( {
//         ...prev,
//         [ payload.id ]: {
//             data: payload.data,
//             loading: false,
//             error: payload.error || null,
//             timestamp: Date.now()
//         }
//     } ) );
// } );

// Your Lifecycle (Source Events)
//         typescriptlifecycle.start(); // You trigger start
//
// // Triggered when sources emit data
//         const unsubscribe = lifecycle.onData((payload) => {
//             // Called when database emits
//             // Called when editor emits
//         });

// lifecycle.cleanup(); // You trigger cleanup

// Register hooks (like Angular lifecycle methods)

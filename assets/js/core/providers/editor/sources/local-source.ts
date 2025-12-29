import { elementorAdapter } from "@app/adapters";
import { DataSourceFactory, Notify, Unsubscribe } from "@app/types";
import { MarionetteElement } from "@app/adapters/elementor/sync/get-selected-element";
import { LocalElementData } from "@app/adapters/elementor/elementor-adapter";

export const createLocalSource: DataSourceFactory< LocalElementData > = () => {
    let notify: Notify<LocalElementData> | null = null;
    let unsubscribeSelect: Unsubscribe | null = null;
    let unsubscribeDeselect: Unsubscribe | null = null;
    let modelCleanup: Unsubscribe | null = null;

    const getData = ( element: MarionetteElement ) => {
        return elementorAdapter.elementDataExtractor( element ) as LocalElementData
    };

    const handleSelect = () => {
        modelCleanup?.();
        modelCleanup = null;

        const element = elementorAdapter.getSelectedElement();

        if ( ! element ) {
            notify?.( null );

            return;
        }

        modelCleanup = elementorAdapter.elementSubscriber.subscribe( element, ( element ) =>
            notify?.( getData( element ) )
        )

        // initial call
        notify?.( getData( element ) );
    }

    const handleDeselect = () => {
        modelCleanup?.();
        modelCleanup = null;
        notify?.(null);
    }

    return {
        start: ( notifyFn: Notify<LocalElementData> ) => {
            notify = notifyFn;

            unsubscribeSelect = elementorAdapter.onCommand(
                'document/elements/select',
                handleSelect,
            );

            unsubscribeDeselect = elementorAdapter.onCommand(
                [
                    'document/elements/deselect',
                    'document/elements/deselect-all',
                    'document/elements/delete',
                    'panel/exit',
                ],
                handleDeselect
            );

            handleSelect();
        },
        stop: () => {
            unsubscribeSelect?.();
            unsubscribeDeselect?.();
            modelCleanup?.();

            unsubscribeSelect = null;
            unsubscribeDeselect = null;
            modelCleanup = null;
            notify = null;
        },
    }
}

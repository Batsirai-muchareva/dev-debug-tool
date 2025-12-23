import { EditorMode } from "@app/providers/editor-provider/modes/types";
import { createElementorEventSubscriber } from "@app/events/subscribers/create-elementor-event-subscriber";
import { getSelectedElement, MarionetteElement } from "@app/sync/get-selected-element";
import { Callback } from "@app/types";
import { createElementProvider } from "@app/providers/editor-provider/modes/element/create-element-provider";
import {
    createElementEventSubscriber
} from "@app/providers/editor-provider/modes/element/create-element-event-subscriber";
import { createElementDataExtractor } from "@app/providers/editor-provider/modes/element/create-element-data-extractor";

const elementorSubscriber = createElementorEventSubscriber();

const EXCLUDED_KEYS = [ 'defaultEditSettings', 'editSettings' ]

export function localMode(
    notify: ( data: any ) => void
): EditorMode {
    const elementProvider = createElementProvider( getSelectedElement );
    const dataExtractor = createElementDataExtractor( EXCLUDED_KEYS );
    const eventSubscriber = createElementEventSubscriber();
    // the extractor and provider should be one api

    let elementCleanup: Callback | null = null;

    const notifyElement = ( element: MarionetteElement | null ) => {
        if ( ! element ) {
            notify( null );
            return;
        }

        const extracted = dataExtractor.extract( element ) as any;

        // globalClassesIds = extracted.settings.classes?.value ?? [];

        // sync global classes with
        notify( extracted );
    };

    const subscribeToElement = () => {
        const element = elementProvider.getCurrent();

        if ( ! element ) {
            return notify( null );
        }

        elementCleanup = eventSubscriber.subscribe( element, notifyElement );
        notifyElement( element );
    };

    return {
        id: 'local',
        label: 'Local',

        start() {
            elementorSubscriber.subscribe('document/elements/select', subscribeToElement );

            elementorSubscriber.subscribe(
                [
                    'panel/exit',
                    'document/elements/delete',
                    'document/elements/deselect',
                    'document/elements/deselect-all',
                ],
                () => {
                    elementCleanup?.();
                    notify( null );
                }
            );

            subscribeToElement();
        },

        stop() {
            elementCleanup?.();
            elementCleanup = null;
            elementorSubscriber.unsubscribeAll();
        },
    };
}

import { EditorMode } from "@app/providers/editor-provider/modes/types";
import {
    createLocalStoragePoller
} from "@app/providers/editor-provider/modes/global-classes-mode/create-local-storage-poller";

export function globalClassesMode(
    notify: (data: any) => void,
    onIdle: () => void
): EditorMode {

    const poller = createLocalStoragePoller(
        value => notify( value ),
        onIdle
    );

    return {
        id: 'global_classes',
        label: 'Classes',
        start() {
            poller.start();
        },
        stop() {
            poller.stop();
        },
    };
}

import {
    getUsedGlobalClassesSnapshot
} from "@app/providers/editor-provider/modes/global-classes-mode/get-used-global-classes-snapshot";

const POLL_INTERVAL = 1000;

const INACTIVITY_LIMIT = 1 * 60 * 1000;

export function createLocalStoragePoller(
    onGetData: ( data: any ) => void,
    onIdle: () => void
) {
    let intervalId: number | null = null;
    let lastSnapshot: string | null = null;
    let lastActivity = 0;

    const start = () => {
        if ( intervalId !== null ) {
            return;
        }

        lastSnapshot = getUsedGlobalClassesSnapshot();
        lastActivity = Date.now();

        onGetData( lastSnapshot );

        intervalId = window.setInterval( () => {
            const current = getUsedGlobalClassesSnapshot();

            if ( JSON.stringify( current ) !== JSON.stringify( lastSnapshot ) ) {
                lastSnapshot = current; // nullify these on stop
                lastActivity = Date.now(); // this too JSON.parse(
                onGetData( current );
            }

            if ( Date.now() - lastActivity > INACTIVITY_LIMIT ) {
                stop();
                onIdle();
            }
        }, POLL_INTERVAL );
    };

    const stop = () => {
        if ( intervalId === null ) {
            return;
        }

        clearInterval( intervalId );
        intervalId = null;
    };

    return { start, stop };
}

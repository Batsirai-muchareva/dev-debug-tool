import { DataSourceFactory, Notify } from "@app/types";
import { elementorAdapter } from "@app/adapters";
import { GlobalClasses } from "@app/adapters/elementor/elementor-adapter";

const POLL_INTERVAL = 1000;

const INACTIVITY_LIMIT = 2 * 60 * 1000;

export const createGlobalClassesSource: DataSourceFactory< GlobalClasses, { onIdle?: () => void } > =
    ( config ) => {

    let notify: Notify<GlobalClasses> | null = null;
    let intervalId: number | null = null;
    let lastSnapshot: GlobalClasses | null = null;
    let lastActivity = 0;

    const poll = () => {
        const current = elementorAdapter.getUsedGlobalClassesSnapshot();

        if ( JSON.stringify( current ) !== JSON.stringify( lastSnapshot ) ) {
            lastSnapshot = current;
            lastActivity = Date.now();
            notify?.( current );
        }

        if ( Date.now() - lastActivity > INACTIVITY_LIMIT ) {
            stop();

            if ( config?.onIdle ) {
                config?.onIdle()
            }
        }
    }

    return {
        start( notifyFn: Notify<GlobalClasses> ) {
            notify = notifyFn;

            if ( intervalId !== null ) {
                return;
            }

            lastSnapshot = elementorAdapter.getUsedGlobalClassesSnapshot();
            lastActivity = Date.now();

            notify?.( lastSnapshot ?? [] );

            intervalId = window.setInterval( poll, POLL_INTERVAL );
        },
        stop() {
            if ( intervalId === null ) {
                return;
            }

            clearInterval( intervalId );
            intervalId = null;
            notify = null;
            lastSnapshot = null;
        }
    }
}

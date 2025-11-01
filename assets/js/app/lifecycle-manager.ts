import { CleanupFn, SourceProvider } from "./types";

type LifecycleHook = {
    onMount?: (refetch: () => void) => CleanupFn;
    onUnmount?: () => void;
};

export const createLifecycleManager = (
    provider: SourceProvider,
    refetch: () => void
): CleanupFn => {
    if ( ! provider.lifecycle?.onMount ) {
        return () => {};
    }

    const cleanup = provider.lifecycle.onMount(refetch);

    return () => {
        cleanup?.();
        provider.lifecycle?.onUnmount?.();
    };
};

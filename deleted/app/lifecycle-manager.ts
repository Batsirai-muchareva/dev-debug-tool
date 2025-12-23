import { CleanupFn, SourceProvider } from "./types";

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

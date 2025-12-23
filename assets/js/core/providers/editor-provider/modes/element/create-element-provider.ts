import { MarionetteElement } from "@app/sync/get-selected-element";

type ElementProvider = {
    getCurrent: () => MarionetteElement | null;
}

export const createElementProvider = (
    getElementFn: () => MarionetteElement | null
): ElementProvider => ( {
    getCurrent: getElementFn
} );

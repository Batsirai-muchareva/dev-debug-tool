type Handler = ( data: any ) => void;

type ElementorElement = {
    id: string;
    cid: string;
    model: ElementorElementModel;
    view?: unknown;
    parent?: ElementorElement;
    children?: ElementorElement[];
    getContainer?: () => ElementorElement;
}

type ElementorElementModel = {
    get: ( key: string ) => unknown;
    set: ( key: string, value: unknown ) => void;
    toJSON: () => Record<string, unknown>;
    on: ( event: string, handler: Handler ) => void;
    off: ( event: string, handler: Handler ) => void;
}

export type ExtendedWindow = Window & {
    elementor: {
        selection: {
            getElements: () => ElementorElement[]
        }
    }
}

export function getSelectedElement() {
    const extendedWindow = window as unknown as ExtendedWindow;

    return extendedWindow.elementor.selection.getElements()[0]
}

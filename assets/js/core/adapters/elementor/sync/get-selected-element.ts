export type EventCallback = ( data: any ) => void;

export type EventEmitter = {
    on: ( event: string, callback: EventCallback ) => void;
    off: ( event: string, callback: EventCallback ) => void;
}

type ElementModel = EventEmitter & {
    get: (key: string) => EventEmitter;
    toJSON: (options?: { remove?: string[] }) => any;
}

export type MarionetteElement = {
    model: ElementModel;
}

export type ExtendedWindow = Window & {
    elementor: {
        selection: {
            getElements: () => MarionetteElement[]
        }
    }
}

export function getSelectedElement() {
    const extendedWindow = window as unknown as ExtendedWindow;

    return extendedWindow.elementor.selection.getElements()[0]
}

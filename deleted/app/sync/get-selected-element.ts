type Listeners = {
    on: ( event: string, callback: ( data: any ) => void ) => void;
    off: ( event: string, callback: () => void ) => any;
}

type Element = {
    model: Listeners & {
        get: ( key: string ) => Listeners;
        toJSON: ( options: any ) => any;
    }
}
export type ExtendedWindow = Window & {
    elementor: {
        selection: {
            getElements: () => Element[]
        }
    }
}

export function getSelectedElement() {
    const extendedWindow = window as unknown as ExtendedWindow;

    return extendedWindow.elementor.selection.getElements()[0]
}

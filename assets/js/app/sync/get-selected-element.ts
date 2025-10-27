type Element = {
    model: {
        on: ( event: string, callback: ( data: any ) => void ) => void;
        off: ( event: string, callback: () => void ) => any;
        toJSON: () => any;
    }
}
export type Selection = Window & {
    elementor: {
        selection: {
            getElements: () => Element[]
        }
    }
}

export function getSelectedElement() {
    const browserWindow = window as unknown as Selection;

    return browserWindow.elementor.selection.getElements()[0]
}

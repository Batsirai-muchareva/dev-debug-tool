export type ExtendedWindow = Window & {
    devDebugTool: {
        nonce: string;
        baseUrl: string;
        databaseAjaxAction: string;
    }
}

export function getSettings() {
    const extendedWindow = window as unknown as ExtendedWindow;

    return extendedWindow.devDebugTool
}

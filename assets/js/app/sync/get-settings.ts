export type Settings = Window & {
    devDebugTool: {
        nonce: string;
        baseUrl: string;
        databaseAjaxAction: string;
    }
}

export function getSettings() {
    const browserWindow = window as unknown as Settings;

    return browserWindow.devDebugTool
}

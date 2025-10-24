type Setting = Window & {
    myPluginData: {
        menus: any
    }
}

export function getSettings() {
    const browserWindow = window as unknown as Setting;

    return browserWindow.myPluginData
}

import { createContext, useContext } from "@wordpress/element";
import { getSettings } from "../sync/get-settings";


const SettingsContext = createContext( undefined );

export const SettingsProvider = ({ children }) => {
    const settings = getSettings();

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};

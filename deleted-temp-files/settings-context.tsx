// import * as React from "react";
// import { createContext, useContext } from "@wordpress/element";
// import { getSettings, Settings } from "../sync/get-settings";
// import { PropsWithChildren } from "react";
//
// const SettingsContext = createContext<Settings['devDebugTool']>( undefined as any );
//
// export const SettingsProvider = ( { children }: PropsWithChildren ) => {
//     const settings = getSettings();
//
//     return (
//         <SettingsContext.Provider value={ settings }>
//             {children}
//         </SettingsContext.Provider>
//     );
// };
//
// export const useSettings = () => {
//     const context = useContext(SettingsContext);
//
//     if (!context) {
//         throw new Error("useSettings must be used within a SettingsProvider");
//     }
//     return context;
// };

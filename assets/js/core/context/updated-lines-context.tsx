// import * as React from "react";
// import { PropsWithChildren, useEffect, useState } from "react";
// import { createContext, useContext } from "@wordpress/element";
// import { useFilteredData } from "@app/context/filter-context";
// import { useEventBus } from "@app/hooks/use-event-bus";
//
// const UpdatedLinesContext = createContext< UpdatedLinesContextValue | undefined >();
//
// export const UpdatedLinesProvider = ( { children }: PropsWithChildren ) => {
//     const { data } = useFilteredData();
//     const [ updatedLines, setUpdatedLines ] = useState([]);
//
//     useEffect(() => {
//         // computeUpdatedLines is your diff logic
//         const lines = computeUpdatedLines( data );
//
//         setUpdatedLines( lines );
//     }, [data]);
//
//     return (
//         <UpdatedLinesContext.Provider value={ { } }>
//             { children }
//         </UpdatedLinesContext.Provider>
//     );
// };
//
// export const useUpdatedLines = () => {
//     const context = useContext( UpdatedLinesContext );
//
//     if ( ! context ) {
//         throw new Error("useUpdatedLines must be used within a UpdatedLinesProvider");
//     }
//
//     return context;
// };

import { createContext, useContext, useState } from "@wordpress/element";

type Snapshot = {
    database: Record<string, any>,
    editor: Record<string, any>,
}

type CreateSnapshot = {
    snapshot: Snapshot,
    updateSnapshot: ( newSnapshot: any ) => void
}

const SnapshotContext = createContext<CreateSnapshot>( undefined );

export const SnapshotProvider = ({ children }) => {
    const [ snapshot, setSnapshot] = useState<Snapshot>( {
        database: {},
        editor: {}
    } );

    function updateSnapshot( newSnapshot: any ) {
        setSnapshot( { ...snapshot, ...newSnapshot } );
    }


    return (
        <SnapshotContext.Provider value={ { snapshot, updateSnapshot } }>
            {children}
        </SnapshotContext.Provider>
    );
};

export const useSnapshot = () => {
    const context = useContext(SnapshotContext);

    if (!context) {
        throw new Error("useSchema must be used within a SchemaProvider");
    }
    return context;
};

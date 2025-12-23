import React, { useEffect, useMemo } from "react";
import { PropsWithChildren } from "react";
import { UnknownData } from "@app/types";
import { createContext, useContext } from "@wordpress/element";
import { useDataProvider } from "@app/hooks/use-data-provider";
import { createValueFromPath } from "@app/utils/create-value-from-path";
import { SEARCH_POPOVER_KEY, usePopover } from "@app/context/popover-context";
import { useSuggestions } from "@app/hooks/use-suggestions";
import { useJsonPathSearch } from "@app/hooks/use-json-path-search";
import { usePath } from "@app/hooks/use-path";

type State = {
    data: UnknownData;
    setPath: ( path: string ) => void;
    suggestions: any[];
    path: string;
    paths: string[];
}

const FilterContext = createContext< State | undefined >( undefined );

export const FilterProvider = ( { children }: PropsWithChildren ) => {
    const { path, setPath } = usePath();
    const data = useDataProvider();
    const paths = useJsonPathSearch( data, path );

    const getPathValue = createValueFromPath( data );
    const suggestions = useSuggestions( paths, getPathValue );

    const { close: closeSearchPopover, isOpen } = usePopover( SEARCH_POPOVER_KEY );

    useEffect( () => {
        if ( isOpen && ! data ) {
            closeSearchPopover();
        }
    }, [ data, isOpen ]);

    const content = useMemo( () => {
        if ( ! data ) {
            return data;
        }

        const exact = getPathValue( path );

        // If it's valid, return exact
        if ( exact !== undefined ) {
            return exact;
        }

        // Otherwise find nearest valid parent
        const nearest = findDeepestValidPath( data, path, getPathValue );

        return nearest ? nearest.value : data;
    }, [ data, path ] );

    return (
        <FilterContext.Provider value={ { data: content, suggestions, setPath, path, paths } }>
            { children }
        </FilterContext.Provider>
    );
};

export const useFilteredData = () => {
    const context = useContext( FilterContext );

    if ( ! context ) {
        throw new Error("useFilteredData must be used within a FilterProvider");
    }

    return context;
};

const findDeepestValidPath = (data: any, path: string, getPathValue: (path: string) => any ) => {
    if ( ! path ) {
        return null;
    }

    const segments = path.split(".");

    // Gradually reduce segments from full → root
    while ( segments.length > 0 ) {
        const candidate = segments.join(".");
        const value = getPathValue( candidate );

        if (value !== undefined) {
            return { path: candidate, value };
        }

        segments.pop(); // remove last segment and try parent
    }

    return null;
};

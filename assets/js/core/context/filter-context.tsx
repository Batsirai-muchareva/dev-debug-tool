import React, { useEffect, useMemo } from "react";
import { PropsWithChildren } from "react";
import { createContext, useContext } from "@wordpress/element";
import { useProvider } from "@app/hooks/use-provider";
import { createValueFromPath } from "@app/utils/create-value-from-path";
import { SEARCH_POPOVER_KEY, usePopover } from "@app/context/popover-context";
import { useSuggestions } from "@app/hooks/use-suggestions";
import { useJsonPathSearch } from "@app/hooks/use-json-path-search";
import { usePath } from "@app/context/path-context";
import { lineMap } from "@libs/line-map";

type State = {
    data: unknown;
    originalData: unknown;
    setPath: ( path: string ) => void;
    suggestions: any[];
    path: string;
    paths: string[];
}

const FilterContext = createContext< State | undefined >( undefined );

export const FilterProvider = ( { children }: PropsWithChildren ) => {
    const { path, setPath } = usePath();
    const data = useProvider();
    const paths = useJsonPathSearch( data, path );

    const getPathValue = createValueFromPath( data );
    // TODO: suggestions ar not supposed to be part of here
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

    if ( content ) {
        lineMap.buildLineMap( content );
    }

    return (
        <FilterContext.Provider value={ {
            data: content,
            originalData: data,
            suggestions,
            setPath,
            path,
            paths,
        } }>
            { children }
        </FilterContext.Provider>
    );
};

export const useFilteredData = () => {
    const context = useContext( FilterContext );

    if ( ! context ) {
        throw new Error( "useFilteredData must be used within a FilterProvider" );
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

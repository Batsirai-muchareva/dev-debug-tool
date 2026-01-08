import React from "react"
import { bemBlock } from "@app/utils/bem";
import { usePath } from "@app/context/path-context";
import { useRef, useState, useEffect } from "@wordpress/element";
import { useTabs } from "@app/context/tabs/tabs-context";
import { useBrowse } from "@app/context/browse-context";
import { useSearchKeyboard } from "@app/hooks/use-search-keyboard";

const bemClass = bemBlock.elementClass( 'search' );

const placeholders: Record<string, string> = {
    default: 'Search path...eg color.$$type',
    schema: 'Search schema...'
};

export const Search2 = () => {
    const { path, setPath } = usePath();
    const { activeProvider } = useTabs();
    const { selectedKey } = useBrowse();
    const isSearching = Boolean( path );
    const inputRef = useRef<HTMLInputElement>(null );
    const [ ghostText, setGhostText ] = useState('')
    const ghostRef = useRef<HTMLSpanElement>(null);
    const [shouldSlice, setShouldSlice] = useState(false);

    const { handleKeyDown, handleFocus, moveCaretToEnd, handleChange } = useSearchKeyboard( ghostText, setGhostText, inputRef.current );

    const clearInput = () => {
        setPath('');
        inputRef.current?.focus();
    };

    const getPlaceholder = () => {
        if ( activeProvider === 'schema' && ! selectedKey ) {
            return placeholders.schema
        }

        return placeholders.default
    }

    // const isExactStringOrNestedMatch = ghostText.includes( '.' ) || ! ghostText.startsWith( path );
    //
    // if ( isExactStringOrNestedMatch ) {
    //     inputRef.current?.offsetWidth
    //     ghostText.length
    //     // only slice if the ghostText is bigger than the input
    // }

    const isNestedMatchOrNotExactString = ghostText.includes( '.' ) || ! ghostText.startsWith( path );

    useEffect( () => {
        if ( isNestedMatchOrNotExactString ) {
            const inputTextWidth = inputRef.current?.clientWidth;
            const ghostTextWidth = ghostRef.current?.clientWidth;

            if ( typeof inputTextWidth !== 'number' || typeof ghostTextWidth !== 'number' ) {
                setShouldSlice( false );
            } else {
                setShouldSlice( ( ghostTextWidth + 20) > inputTextWidth )
            }

        }
    }, [ path, ghostText ] )

    // const isNestedMatch =
    //     ghostText.startsWith(path) && ghostText.length > path.length;

    // ✅ Measure layout AFTER render
    // useLayoutEffect(() => {
    //     if (!inputRef.current || !ghostRef.current) {
    //         setShouldSlice(false);
    //         return;
    //     }
    //
    //     if (!isNestedMatch) {
    //         setShouldSlice(false);
    //         return;
    //     }
    //
    //     const inputWidth = inputRef.current.clientWidth;
    //     const inputTextWidth = inputRef.current.scrollWidth;
    //     const ghostTextWidth = ghostRef.current.scrollWidth;
    //
    //     setShouldSlice(inputTextWidth + ghostTextWidth > inputWidth);
    // }, [path, ghostText, isNestedMatch]);

    const ghostSuffix = shouldSlice
        ? ghostText.slice(path.length)
        : ghostText;

    // const ghostSuffix = isExactStringOrNestedMatch
    //     ? ghostText.slice( path.length )
    //     : ghostText;

    return (
        <div data-is-searching={ isSearching } className={ bemBlock.element( 'search' ) }>
            <div className={ bemClass( 'input__wrap' ) }>
                <input
                    ref={ inputRef }
                    value={ path }
                    onChange={ handleChange }
                    className={ bemClass( 'input' ) }
                    placeholder={ getPlaceholder() }
                    onFocus={ handleFocus }
                    onBlur={ moveCaretToEnd }
                    onKeyDown={ handleKeyDown }
                />
                <span
                    ref={ghostRef}
                    className="ghost-text"
                    id="ghost"
                    style={
                        isNestedMatchOrNotExactString
                            ? { paddingLeft: `${path.length + 1}ch` }
                            : undefined
                    }
                >
                    { ghostSuffix }
                </span>
            </div>
            {
                isSearching &&
                (
                    <button
                        onClick={ clearInput }
                        className={ bemClass( 'clear' ) }
                    >
                        <i className="eicon-close"/>
                    </button>
                )
            }
        </div>
    );
}



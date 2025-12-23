import React, { useEffect, useState } from "react";
// import { dispatchCustomEvent } from "@app/events";
import { getSections } from "@app/sections/create-sections-registry";
import { useTabs } from "@app/context/tabs/tabs-context";

export const Sections = () => {
    const { activeTab } = useTabs();
    const sections = Array.from( getSections().values() );
    const currentSections = sections.filter((obj)=> obj.id === activeTab );
    const [ selectedSection, setSelectedSection ] = useState<string>()

    const handleClick = ( meta_key: string, post_id: string ) => {
        // dispatchCustomEvent( 'database/refetch', {
        //     detail: { meta_key, post_id }
        // } );

        setSelectedSection( meta_key )
    }

    useEffect( () => {
        if ( ! selectedSection ) {
            setSelectedSection( currentSections[0]?.meta_key )
        }
    }, [ activeTab ] );

    if ( currentSections.length === 0 ) {
        return null;
    }

    return (
        <div style={ { display: 'flex', gap: '1rem', marginBlock: '8px' } }>
            { sections.map( ( v, i ) => {
                return <span style={ {
                    background: selectedSection === v.meta_key ? 'red' : '',
                    padding: '0.4rem',
                    border: '1px solid #7d858a',
                    borderRadius: '6px'
                } } key={ i } onClick={() => handleClick( v.meta_key, v.post_id ) }>{ v.title }
                </span>
            }) }
        </div>
    )
}

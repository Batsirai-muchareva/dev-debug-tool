import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from "@wordpress/element";
import { useSnapshot } from "../context/snapshot-context";
import { Data } from "../types";

export default function Tabs() {
    const [activeTab, setActiveTab] = useState( '' );
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabHeaderRef = useRef<any>(null);

    const { snapshot } = useSnapshot();

    const updateIndicator = ( tabId: string ) => {
        const button = document.querySelector(`[data-tab="${tabId}"]`);
        if ( button && tabHeaderRef.current ) {
            const buttonRect = button.getBoundingClientRect();
            const containerRect = tabHeaderRef.current.getBoundingClientRect();
            setIndicatorStyle({
                width: `${buttonRect.width}px`,
                left: `${buttonRect.left - containerRect.left}px`
            });
        }
    };

    const tabs = useMemo(() => {
        return Object.entries( snapshot ).map(([key, value]) => {

            return {
                id: key,
                label: value.label,
                content: JSON.stringify( value.content, null, 2 )
            }
        })
    }, [ snapshot ]);

    useEffect(() => {
        if (tabs.length > 0 && !activeTab) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs.length]);

    useEffect( () => {
        if ( activeTab ) {
            updateIndicator(activeTab);
        }

        const handleResize = () => updateIndicator(activeTab);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab]); // Removed snapshot.snapshot dependency to prevent unnecessary re-renders

    const handleTabClick = ( tabId: string ) => {
        setActiveTab( tabId );
    };

   const activeTabObj = tabs.find(tab => tab.id === activeTab);

    const shouldShowSchema = ( content: Data | string ) => typeof content !== 'string';

    return (
        <div className="dev-debug__tabs-container">
            <div className="dev-debug__tab-wrapper">
                <div ref={tabHeaderRef} className="dev-debug__tab-header">
                    { tabs.map((tab) => (
                        <button
                            key={tab.id}
                            data-tab={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`dev-debug__tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div className="dev-debug__tab-indicator" style={indicatorStyle} />
                </div>

                <div className="dev-debug__tab-content">
                    <div className="dev-debug__tab-panel active">
                        {/*{}*/}
                        {/*<SyntaxHighlighter language="json" style={ atelierSulphurpoolDark }>*/}
                        {/*<SyntaxHighlighter language="json" style={ atomOneDark }>*/}
                        {/*<SyntaxHighlighter language="json" style={ vs2015 }>*/}
                        {/*<JsonSyntaxHighlighter content={ activeTabObj.content} />*/}
                        {/*<SyntaxHighlighter language="json" style={ atomOneDark } customStyle={ { flex: 1 } } >*/}
                        {/*    {  ?? '' }*/}
                        {/*</SyntaxHighlighter>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}

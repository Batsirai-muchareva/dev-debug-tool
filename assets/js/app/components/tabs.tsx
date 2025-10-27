import * as React from 'react';
import { useState, useRef, useEffect } from "@wordpress/element";
import { useSnapshot } from "../context/snapshot-context";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
    a11yDark,
    androidstudio,
    anOldHope,
    atelierCaveDark, atelierDuneDark, atelierSulphurpoolDark, atomOneDark,
    dark,
    docco,
    github, gradientDark, nightOwl, vs2015
} from "react-syntax-highlighter/dist/cjs/styles/hljs";

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

    const tabs = createTabs();

    useEffect(() => {
        if (tabs.length > 0 && !activeTab) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs.length]);

    useEffect( () => {
        if ( activeTab ) {
            updateIndicator(activeTab);
        }

        // updateIndicator(activeTab);
        const handleResize = () => updateIndicator(activeTab);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab, snapshot.snapshot]);

    const handleTabClick = ( tabId: string ) => {
        setActiveTab( tabId );
    };

    function createTabs() {
        return Object.entries( snapshot ).map(([key, value]) => {
            return {
                id: key,
                label: value.label,
                content: JSON.stringify( value.content, null, 2 )
            }
        })
    }

   const activeTabObj = tabs.find(tab => tab.id === activeTab);

    const activeTabContent = activeTabObj?.content;

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
                        {/*<SyntaxHighlighter language="json" style={ atelierSulphurpoolDark }>*/}
                        {/*<SyntaxHighlighter language="json" style={ atomOneDark }>*/}
                        {/*<SyntaxHighlighter language="json" style={ vs2015 }>*/}
                        <SyntaxHighlighter language="json" style={ atomOneDark } customStyle={ { flex: 1 } } >
                            { activeTabContent as string }
                        </SyntaxHighlighter>
                        {/*<pre className="dev-debug__json-content">*/}
                        {/*    { activeTabContent }*/}
                        {/*</pre>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}

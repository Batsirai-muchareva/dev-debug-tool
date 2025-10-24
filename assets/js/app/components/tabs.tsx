import * as React from 'react';
import { useState } from "@wordpress/element";

export default function Tabs() {
    const [activeTab, setActiveTab] = useState('overview');
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabHeaderRef = React.useRef(null);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'features', label: 'Features' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'contact', label: 'Contact' }
    ];

    const updateIndicator = (tabId) => {
        const button = document.querySelector(`[data-tab="${tabId}"]`);
        if (button && tabHeaderRef.current) {
            const buttonRect = button.getBoundingClientRect();
            const containerRect = tabHeaderRef.current.getBoundingClientRect();
            setIndicatorStyle({
                width: `${buttonRect.width}px`,
                left: `${buttonRect.left - containerRect.left}px`
            });
        }
    };

    React.useEffect(() => {
        updateIndicator(activeTab);
        const handleResize = () => updateIndicator(activeTab);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className="tabs-container">
            <div className="tab-wrapper">
                <div ref={tabHeaderRef} className="tab-header">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            data-tab={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div className="tab-indicator" style={indicatorStyle} />
                </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
              <div className="tab-panel active">
              <h2>Welcome to Modern Tabs</h2>
              <p>
                This is a beautiful, responsive tab component built with React and custom CSS.
              </p>
              <p>
                The design features smooth animations, a sliding indicator, and a clean modern aesthetic that works perfectly across all devices.
              </p>
              <p>
                Navigate through the tabs to explore different sections of content with seamless transitions.
              </p>
            </div>
          )}

            {activeTab === 'features' && (
                <div className="tab-panel active">
              <h2>Key Features</h2>
              <p>Our tab component comes with everything you need:</p>
              <ul className="feature-list">
                <li>Smooth sliding indicator animation</li>
                <li>Responsive design for all screen sizes</li>
                <li>Fade-in animations for content</li>
                <li>Modern gradient styling</li>
                <li>Easy to customize colors and styles</li>
                <li>Accessible keyboard navigation</li>
              </ul>
            </div>
            )}

            {activeTab === 'pricing' && (
                <div className="tab-panel active">
              <h2>Pricing Plans</h2>
              <p>Choose the plan that works best for you:</p>
              <p>
                <strong>Free Plan</strong> - Perfect for getting started with all basic features included at no cost.
              </p>
              <p>
                <strong>Pro Plan</strong> - $29/month - Unlock advanced features and priority support for professional projects.
              </p>
              <p>
                <strong>Enterprise Plan</strong> - Custom pricing - Get dedicated support, custom integrations, and unlimited usage.
              </p>
            </div>
            )}

            {activeTab === 'contact' && (
                <div className="tab-panel active">
              <h2>Get in Touch</h2>
              <p>
                We'd love to hear from you! Reach out to us through any of the following channels:
              </p>
              <p><strong>Email:</strong> hello@moderntabs.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Web Street, Internet City, IC 12345</p>
              <p>
                Our support team is available Monday through Friday, 9 AM to 5 PM EST.
              </p>
            </div>
            )}
        </div>
      </div>
        </div>
    );
}

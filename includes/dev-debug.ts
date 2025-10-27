import * as React from 'react';
import { createRoot } from '@wordpress/element';
import { App } from "./App";
import domReady from '@wordpress/dom-ready';
import './frontend.css';

domReady( () => {
    const root = createRoot( document.getElementById( 'app-root' ) );

    root.render( React.createElement( App ) );
} );

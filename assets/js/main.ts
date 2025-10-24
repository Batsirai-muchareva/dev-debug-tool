import * as React from 'react';
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

import { App } from "./app/App";
// import '../css/dev-debug.css';

domReady( () => {
    const root = createRoot( document.getElementById( 'dev-debug-slot' ) );

    root.render( React.createElement( App ) );
} );

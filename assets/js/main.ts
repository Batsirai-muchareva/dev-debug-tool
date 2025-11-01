import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import '../scss/dev-debug.scss';
import '../scss/dev-debug-resizable.scss';

import { App } from "./app/App";
import { createElement } from "react";

domReady( () => {
    const root = createRoot( document.getElementById( 'dev-debug-slot' ) as HTMLElement );

    root.render( createElement( App ) );
} )

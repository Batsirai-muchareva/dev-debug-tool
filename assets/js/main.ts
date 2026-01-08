import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

import { App } from "./app";
import { createElement } from "react";

domReady( () => {
    const root = createRoot( document.getElementById( 'dev-debug-slot' ) as HTMLElement );

    root.render( createElement( App ) );
} )

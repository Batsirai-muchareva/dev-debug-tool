export function editorPointerEvents( disableEvents: boolean ) {
    const elementorPreview = document.getElementById( 'elementor-preview' );

    if ( ! elementorPreview ) {
        return;
    }

    if ( disableEvents ) {
        elementorPreview.classList.add( 'dev-debug-resizable__disable-events' );
    } else {
        elementorPreview.classList.remove( 'dev-debug-resizable__disable-events' );
    }
}

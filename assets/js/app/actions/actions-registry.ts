type Action = {
    id: string;
    icon: string;
    title: string;
    className: string;
    onClick: () => void;
}

const createActionsRegistry = () => {
    const actions: Record<string, Action> = {}

    const registerAction = ( action: Action ) => {
        actions[ action.id ] = action;
    }

    const getActions = () => {
      return Object.values( actions ) as Action[];
    }

    return {
        registerAction,
        getActions
    }
}

export const actionsRegistry = createActionsRegistry();

// export default function useActionProps() {
//     const document = useActiveDocument();
//
//     return {
//         icon: EyeIcon,
//         title: __( 'Preview Changes', 'elementor' ),
//         onClick: () => {
//             const extendedWindow = window as unknown as ExtendedWindow;
//             const config = extendedWindow?.elementorCommon?.eventsManager?.config;
//
//             if ( config ) {
//                 extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.previewPage, {
//                     location: config.locations.topBar,
//                     secondaryLocation: config.secondaryLocations[ 'preview-page' ],
//                     trigger: config.triggers.click,
//                     element: config.elements.buttonIcon,
//                 } );
//             }
//
//             if ( document ) {
//                 runCommand( 'editor/documents/preview', {
//                     id: document.id,
//                     force: true,
//                 } );
//             }
//         },
//     };
// }

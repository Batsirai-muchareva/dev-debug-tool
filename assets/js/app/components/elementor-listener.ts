import { useEffect } from "@wordpress/element";
import { useSnapshot } from "../context/snapshot-context";
import { subscribeToElementorCommand } from "../sync/subscribe-to-elementor-command";

// export const ElementorListener = () => {
//
//     useEffect(() => {
//         listenToElementSelect(() => {
//             updateEditorSchema()
//         });
//
//         listenToDocumentSave(()=> {
//             refetch()
//         })
//     })
//     return null;
// }

function listenToElementSelect( callback: () => void ) {
    subscribeToElementorCommand('run:after', ( component, command, args ) => {
        if ( 'document/elements/select' === command ) {
            callback()
        }
    } )
}

function listenToDocumentSave( callback: () => void ) {
    subscribeToElementorCommand('run:after', ( component, command, args ) => {
        if ( 'document/save/update' === command ) {
            callback();
        }
    } )
}

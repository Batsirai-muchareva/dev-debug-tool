import { createElementProvider } from "@app/providers/editor-provider/modes/element/create-element-provider";
import { createElementDataExtractor } from "@app/providers/editor-provider/modes/element/create-element-data-extractor";
import { getSelectedElement } from "@app/sync/get-selected-element";

const EXCLUDED_KEYS = [ 'defaultEditSettings', 'editSettings' ]
const STORAGE_KEY = 'elementor-global-classes';

export const getUsedGlobalClassesSnapshot = () => {
    const elementProvider = createElementProvider( getSelectedElement );
    const dataExtractor = createElementDataExtractor( EXCLUDED_KEYS );

    const element = elementProvider.getCurrent();

    if ( ! element ) {
        return;
    }

    const usedGlobalClasses = ( dataExtractor.extract( element ) as any ).settings.classes?.value ?? [];
    const parsed = JSON.parse( localStorage.getItem( STORAGE_KEY ) ?? '[]' );

    return parsed.filter( ( gc: { id: string } ) => usedGlobalClasses.includes( gc.id ) );
}

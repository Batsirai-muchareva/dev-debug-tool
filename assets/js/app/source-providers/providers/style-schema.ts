import { createSourceProvider } from "../create-source-provider";

export const styleSchema = createSourceProvider( {
    key: 'style-schema',
    label: 'Style Schema',
    actions: {
        type: 'value',
        get: () => {
            return ( window as any ).elementor.config.atomic.styles_schema;
        }
    }
} )

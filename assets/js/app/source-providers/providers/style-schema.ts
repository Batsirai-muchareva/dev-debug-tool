export const styleSchema = {
    key: 'style-schema',
    label: 'Style Schema',
    actions: {
        type: 'value',
        get: () => {
            return ( window as any ).elementor.config.atomic.styles_schema;
        }
    }
};

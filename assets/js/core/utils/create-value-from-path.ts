export const createValueFromPath = ( data: unknown ): any => {
    return (  path: string ) => {
        if ( ! isObject( data ) ) {
            return undefined;
        }

        try {
            const keys = path
                .split( /[.\[\]]/ )
                .filter( Boolean );

            let current: unknown = data;

            for ( let key of keys ) {
                if ( ! isObject( current ) ) {
                    return undefined
                }

                current = current[ key as keyof typeof current ];
            }

            return current;
        } catch {
            return undefined;
        }
    }
};

const isObject = ( value: unknown ): value is object =>
    typeof value === "object" && value !== null;

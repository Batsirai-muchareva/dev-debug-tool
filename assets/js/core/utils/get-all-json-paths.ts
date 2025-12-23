export const getAllJsonPaths = ( input: unknown ): string[] => {
    const paths: string[] = [];
    const stack: Array<{ value: unknown; path: string }> = [];

    if ( isObject( input ) ) {
        stack.push( { value: input, path: "" } );
    }

    const seen = new WeakSet<object>(); // Prevent circular loops

    while ( stack.length > 0 ) {
        const { value, path } = stack.pop()!;

        if ( ! isObject( value ) || seen.has( value ) ) {
            continue;
        }

        seen.add( value );

        for ( const key of Object.keys( value ) ) {
            const child = value[key];
            const childPath = path ? `${path}.${key}` : key;

            if ( isObject( child ) ) {
                paths.push( childPath );
                stack.push( { value: child, path: childPath } );

                if ( Array.isArray( child ) && child.length > 0 ) {
                    if ( isObject(child[0] ) ) {
                        const arrPath = `${childPath}[0]`;
                        paths.push(arrPath);
                        stack.push({ value: child[0], path: arrPath });
                    }
                    // const arrPath = `${childPath}[0]`;
                    //
                    // paths.push( arrPath );
                    // stack.push( { value: child[0], path: arrPath } );
                }
            }
        }
    }

    return paths;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

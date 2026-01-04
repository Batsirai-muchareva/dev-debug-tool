type WhenProps = {
    if: boolean;
    children: React.ReactNode;
};

export const When = ( { if: condition, children }: WhenProps ) => {
    if ( ! condition ) {
        return null
    }

    return children
}

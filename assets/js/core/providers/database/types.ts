export type DatabaseData = {
    schema: unknown;
    postId: string;
    metaKey: string;
};

export type SourceConfig = {
    metaKey: string;
    postId: string;
    refreshOnSave?: boolean;
}

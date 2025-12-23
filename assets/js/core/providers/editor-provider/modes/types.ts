export type EditorMode = {
    id: string;
    label: string;
    start(): void;
    stop(): void;
}

export type Mode = 'local' | 'global_classes';

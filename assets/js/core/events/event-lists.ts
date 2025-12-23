export const POSITION_CHANGE_EVENT = 'dev-debug/position/change';
export const WINDOW_RESIZE_EVENT = 'dev-debug/window/resize';
export const DRAG_POPOVER_EVENT = 'dev-debug/popover/drag';
export const RESIZE_POPOVER_EVENT = 'dev-debug/popover/resize';
export const POPOVER_OPEN_EVENT = 'dev-debug/popover/open';
export const SELECT_SUGGESTION_EVENT = 'dev-debug/suggestion/select';
export const STYLE_SCHEMA_PATH_UPDATED = 'dev-debug/style-schema/path-updated';
export const SWITCH_SUB_TAB_EVENT = 'dev-debug/switch/sub-tab';
export const DataGetEvent = ( identifier: string, id: string ) =>
    `dev-debug/${ identifier }/${ id }/data/get`;

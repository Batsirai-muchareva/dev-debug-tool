interface ElementEvents {
    'element:selected': {
        elementId: string;
        data: Record<string, unknown>;
    };
    'element:deselected': void;
    'element:updated': {
        elementId: string;
        changes: Record<string, unknown>;
    };
}

interface WindowEvents {
    'window:mousemove': {
        clientX: number;
        clientY: number;
    };
    'window:mouseup': void;
}

interface Notification {
    'notification:show': {
        id: string;
        message: string;
        type: string;
    },
    'notification:hide': {
        id: string;
    },
}

interface PopoverEvents {
    'popover:opened': {
        popoverId: string;
    };
    'popover:closed': {
        popoverId: string;
    };
    'popover:dragged': {
        popoverId: string;
        position: { x: number; y: number };
    };
    'popover:resized': {
        popoverId: string;
        size: { width: number; height: number };
    };
}

interface TabEvents {
    'tab:changed': {
        tabId: string;
        previousTabId: string;
    };
    'subtab:changed': {
        tabId: string;
        subTabId: string;
        previousSubTabId: string;
    };
}

interface SuggestionEvents {
    'suggestion:select': void;
}

export interface EventMap extends
    ElementEvents,
    PopoverEvents,
    TabEvents,
    SuggestionEvents,
    WindowEvents,
    Notification
{}

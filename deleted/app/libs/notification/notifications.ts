export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

export const NOTIFICATION_SHOW_EVENT = 'dev-debug:notification:show';
export const NOTIFICATION_REMOVE_EVENT = 'dev-debug:notification:remove';

// Custom event types
export interface NotificationShowEvent extends CustomEvent {
    detail: Notification;
}

export interface NotificationRemoveEvent extends CustomEvent {
    detail: { id: string };
}

/**
 * Show a notification
 */
export const showNotification = ( message: string, type: NotificationType = 'success' ): void => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message, type };

    const event = new CustomEvent( NOTIFICATION_SHOW_EVENT, {
        detail: notification
    } ) as NotificationShowEvent;

    window.dispatchEvent(event);

    // Auto-remove after 3 seconds
    setTimeout( () => removeNotification( id ) , 3000 );
};

export const removeNotification = ( id: string): void => {
    const event = new CustomEvent(NOTIFICATION_REMOVE_EVENT, {
        detail: { id }
    }) as NotificationRemoveEvent;

    window.dispatchEvent(event);
};


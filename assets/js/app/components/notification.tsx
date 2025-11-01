import * as React from "react";
import { useEffect, useState } from "@wordpress/element";
import {
    Notification,
    NOTIFICATION_SHOW_EVENT,
    NOTIFICATION_REMOVE_EVENT,
    NotificationShowEvent,
    NotificationRemoveEvent,
    removeNotification
} from "../libs/notification/notifications";

export const NotificationComponent = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const handleShow = (event: Event) => {
            const customEvent = event as NotificationShowEvent;
            setNotifications(prev => [...prev, customEvent.detail]);
        };

        const handleRemove = (event: Event) => {
            const customEvent = event as NotificationRemoveEvent;
            setNotifications(prev => prev.filter(n => n.id !== customEvent.detail.id));
        };

        window.addEventListener(NOTIFICATION_SHOW_EVENT, handleShow);
        window.addEventListener(NOTIFICATION_REMOVE_EVENT, handleRemove);

        return () => {
            window.removeEventListener(NOTIFICATION_SHOW_EVENT, handleShow);
            window.removeEventListener(NOTIFICATION_REMOVE_EVENT, handleRemove);
        };
    }, []);

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="dev-debug__notifications">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`dev-debug__notification dev-debug__notification--${notification.type}`}
                    onClick={() => removeNotification(notification.id)}
                >
                    <span className="dev-debug__notification-message">
                        {notification.message}
                    </span>
                    <button
                        className="dev-debug__notification-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                        }}
                        aria-label="Close notification"
                    >
                        <i className="eicon-close"></i>
                    </button>
                </div>
            ))}
        </div>
    );
};


import React from "react"
import { bemBlock } from "@app/utils/bem";
import { elementorAdapter } from "@app/adapters";
import { useState } from "@wordpress/element";
import { useEventBus } from "@app/hooks/use-event-bus";
import { INotification } from "@libs/notification/index";
import { EventMap } from "@app/events/event-map";

export const Notification = () => {
    const [ notifications, setNotifications ] = useState<INotification[]>([]);

    const hideNotification = ( { id }: EventMap['notification:hide'] ) => {
        setNotifications( prevState =>
            prevState.filter( notification =>
                notification.id !== id
            )
        );
    };

    useEventBus( 'notification:show', ( notification ) => {
        setNotifications( prevState =>
            [ ...prevState, notification as INotification ]
        )
    } );

    useEventBus( 'notification:hide', hideNotification );

    if ( notifications.length === 0 ) {
        return null;
    }

    const top = ( elementorAdapter.toolbarHeight() ?? 30 ) + 10;

    return (
        <div
            style={ { top } }
            className={ bemBlock.element( 'notifications' ) }
        >
            { notifications.map( ( { id, message, type } ) => (
                <div
                    key={ id }
                    className={ bemBlock.elements( [ 'notification', `notification--${ type }` ] ) }
                >
                    <span>
                        { message }
                    </span>
                    <button className={ bemBlock.element( 'notification-close' ) } data-id={ id } onClick={ () => hideNotification( { id } ) }>
                        <i className="eicon-close"></i>
                    </button>
                </div>
            ) ) }
        </div>
    )
}

import { EventMap } from "@app/events/event-map";

export type EventName = keyof EventMap;
export type EventPayload<E extends EventName> = EventMap[E];
export type EventHandler<E extends EventName> = ( payload: EventPayload<E>) => void;
export type Unsubscribe = () => void;

import { JsonObject } from "@libs/json-diffs/types";

export const isObject =
    ( value: unknown ): value is JsonObject => {

    return typeof value === "object" && value !== null;
}

export const hasKey =
    ( obj: unknown, key: string ): boolean => {

    return isObject( obj ) && Object.prototype.hasOwnProperty.call( obj, key );
}

export const areDifferent =
    ( a: unknown, b: unknown ): boolean => {

    return a !== b;
}

export const bothObjects =
    ( a: unknown, b: unknown ): boolean => {

    return isObject( a ) && isObject( b );
}

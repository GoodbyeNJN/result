import { normalizeError } from "./error";
import { isPromiseLike } from "./types";

import type { Fn } from "./types";

const transformError = (error: unknown, onThrow: Fn | null | undefined) => {
    if (onThrow === null) return error;
    if (onThrow === undefined) return normalizeError(error, transformError);

    return onThrow(error);
};

export const createTry =
    (Ok: Fn, Err: Fn) =>
    (fnOrPromise: unknown, onThrow?: Fn | null): any => {
        const isFunction = typeof fnOrPromise === "function";
        const isPromise = isPromiseLike(fnOrPromise);
        if (!isFunction && !isPromise) {
            const error = new TypeError("Argument must be a function or a promise");

            return Err(transformError(error, onThrow));
        }

        if (isPromise) {
            return fnOrPromise.then(
                value => Ok(value),
                (error: unknown) => Err(transformError(error, onThrow)),
            );
        }

        try {
            const data = fnOrPromise();
            if (!isPromiseLike(data)) {
                return Ok(data);
            }

            return data.then(
                value => Ok(value),
                (error: unknown) => Err(transformError(error, onThrow)),
            );
        } catch (error) {
            return Err(transformError(error, onThrow));
        }
    };

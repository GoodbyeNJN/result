import type { Fn } from "./types";

export const createWrap =
    (_try: Fn) =>
    (fn: unknown, onThrow?: Fn | null): Fn => {
        if (typeof fn !== "function") {
            const error = new TypeError("Argument must be a function");

            return () => {
                return _try(() => {
                    throw error;
                }, onThrow!);
            };
        }

        return (...args) => {
            return _try(() => (fn as Fn)(...args), onThrow!);
        };
    };

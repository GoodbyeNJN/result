import { all } from "./helpers/all";
import { Err } from "./helpers/err";
import { ResultError } from "./helpers/error";
import { gen } from "./helpers/gen";
import { isResult } from "./helpers/isResult";
import { Ok } from "./helpers/ok";
import { _try } from "./helpers/try";
import { wrap } from "./helpers/wrap";

import type { InferErrType, InferOkType } from "./types";
import type { SyncFn } from "@/shared/types";
import type { InspectContext } from "node:util";

export class Result<T = unknown, E = unknown> {
    static is = isResult;

    /**
     * Creates a `Result` from a function or a promise, catching any thrown errors or rejected
     * promises.
     */
    static try = _try;

    /**
     * Wraps a function and returns a new function that always returns a `Result`, catching any
     * thrown errors or rejected promises.
     */
    static wrap = wrap;

    /**
     * Combines multiple `Result` instances into one `Result` containing an array of all `Ok`
     * values, or the first `Err` encountered
     */
    static all = all;

    /**
     * Wraps a generator function where `yield` can return `Err` values early.
     * If the generator completes, the returned value is wrapped in `Ok`.
     */
    static gen = gen;

    private readonly ok: boolean;

    private readonly value: T;

    private readonly error: E;

    private readonly contexts: string[] = [];

    private constructor(ok: boolean, error: E, value: T) {
        this.ok = ok;
        this.error = error;
        this.value = value;
    }

    /** Check if `Result` is `Ok` */
    isOk(): this is Result<T, never> {
        return this.ok;
    }

    /** Check if `Result` is `Ok` and the value matches the predicate */
    isOkAnd(predicate: (value: T) => boolean): this is Result<T, never> {
        return this.isOk() && predicate(this.value);
    }

    /** Check if `Result` is `Err` */
    isErr(): this is Result<never, E> {
        return !this.ok;
    }

    /** Check if `Result` is `Err` and the error matches the predicate */
    isErrAnd(predicate: (error: E) => boolean): this is Result<never, E> {
        return this.isErr() && predicate(this.error);
    }

    /** Maps `Result<T, E>` to `Result<U, E>` */
    map<U>(fn: (value: T) => U): Result<U, E> {
        if (this.isErr()) return this;

        return Ok(fn(this.value));
    }

    /** Maps `Result<T, E>` to `Result<T, F>` */
    mapErr<F>(fn: (error: E) => F): Result<T, F> {
        if (this.isOk()) return this;

        return Err(fn(this.error));
    }

    /** Returns given `result` if `Result` is `Ok`, otherwise returns `Result` directly */
    and<R extends Result<unknown, E>>(result: R): Result<InferOkType<R>, E>;
    and<U>(result: Result<U, E>): Result<U, E>;
    and(result: Result): Result {
        return this.isErr() ? this : result;
    }

    /** Maps `Result<T, E>` to `Result<U, E | F>` with a function */
    andThen<R extends Result>(fn: (value: T) => R): Result<InferOkType<R>, InferErrType<R> | E>;
    andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F>;
    andThen(fn: SyncFn): Result {
        return this.isErr() ? this : fn(this.value);
    }

    /** Returns given `result` if `Result` is `Err`, otherwise returns `Result` directly */
    or<R extends Result<T, unknown>>(result: R): Result<T, InferErrType<R>>;
    or<F>(result: Result<T, F>): Result<T, F>;
    or(result: Result): Result {
        return this.isOk() ? this : result;
    }

    /** Maps `Result<T, E>` to `Result<T | U, F>` with a function */
    orElse<R extends Result>(fn: (error: E) => R): Result<InferOkType<R> | T, InferErrType<R>>;
    orElse<U, F>(fn: (error: E) => Result<U, F>): Result<T | U, F>;
    orElse(fn: SyncFn): Result {
        return this.isOk() ? this : fn(this.error);
    }

    /** Calls the function with the value if `Result` is `Ok` and returns the result unchanged */
    inspect(fn: (value: T) => unknown): Result<T, E> {
        try {
            this.isOk() && fn(this.value);
        } catch {}

        return this;
    }

    /** Calls the function with the error if `Result` is `Err` and returns the result unchanged */
    inspectErr(fn: (error: E) => unknown): Result<T, E> {
        try {
            this.isErr() && fn(this.error);
        } catch {}

        return this;
    }

    /** Unwrap the `Ok` value, or throw an error if `Result` is `Err` */
    unwrap(message?: string | null): T {
        if (this.isErr()) {
            throw new ResultError(
                this,
                message !== null ? (message ?? "Called `unwrap` on an `Err` value") : undefined,
                // oxlint-disable-next-line typescript/unbound-method
                this.unwrap,
            );
        }

        return this.value;
    }

    /** Unwrap the `Err` value, or throw an error if `Result` is `Ok` */
    unwrapErr(message?: string | null): E {
        if (this.isOk()) {
            throw new ResultError(
                this,
                message !== null ? (message ?? "Called `unwrapErr` on an `Ok` value") : undefined,
                // oxlint-disable-next-line typescript/unbound-method
                this.unwrapErr,
            );
        }

        return this.error;
    }

    /** Unwrap the `Ok` value, or return the provided value if `Result` is `Err` */
    unwrapOr<U>(defaultValue: T | U): T | U {
        return this.isOk() ? this.value : defaultValue;
    }

    /** Unwrap the `Ok` value, or compute it from a function if `Result` is `Err` */
    unwrapOrElse<U>(defaultValueGetter: (error: E) => T | U): T | U {
        return this.isOk() ? this.value : defaultValueGetter(this.error);
    }

    /** Matches the `Result` variant and executes the corresponding function */
    match<U, F = U>(ok: (value: T) => U, err: (error: E) => F): U | F {
        return this.isOk() ? ok(this.value) : err(this.error);
    }

    /** Returns an iterable object that yields the `Ok` value and `Err` value */
    iter():
        | ({ ok: true; error: never; value: T } & readonly [ok: true, error: never, value: T])
        | ({ ok: false; error: E; value: never } & readonly [ok: false, error: E, value: never]) {
        if (this.isOk()) {
            return {
                ok: true,
                error: undefined as never,
                value: this.value,
                *[Symbol.iterator]() {
                    yield this.ok;
                    yield this.error;
                    yield this.value;

                    return undefined;
                },
            } as any;
        } else {
            return {
                ok: false,
                error: this.error,
                value: undefined as never,
                *[Symbol.iterator]() {
                    yield this.ok;
                    yield this.error;
                    yield this.value;

                    return undefined;
                },
            } as any;
        }
    }

    *[Symbol.iterator](): Generator<Result<never, E>, T> {
        // When used like `const x = yield* result`:

        // If the result is `Ok`, the value of `x` will be the `Ok` value.
        if (this.isOk()) {
            return this.value;
        }

        // If the result is `Err`, the assignment `const x =` will not occur and yield the `result` to the wrapping generator.
        yield this as unknown as Result<never, E>;

        // In typical usage, this line will never be reached; the `result` is returned here just as a safe fallback.
        return this as unknown as T;
    }

    context(context: string): this {
        this.contexts.push(context);

        return this;
    }

    // See `Inspectable` and `inspect` types in `node:util` for details
    [Symbol.for("nodejs.util.inspect.custom")](
        depth: number,
        options: InspectContext,
        inspect: typeof import("node:util").inspect,
    ): string {
        if (this.isOk()) {
            const inner = inspect(this.value, options);

            return `Ok(${inner})`;
        } else if (this.error instanceof Error) {
            const { name, message } = this.error;
            const inner = inspect(message, options);

            return `Err(${name}(${inner}))`;
        } else {
            const inner = inspect(this.error, options);

            return `Err(${inner})`;
        }
    }
}

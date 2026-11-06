import { createWrap } from "@/shared/wrap";

import { _try } from "./try";

import type { Result } from "../result";
import type { AsyncFn, SyncFn } from "@/shared/types";

export interface Wrap {
    <A extends any[], T, E = Error>(fn: SyncFn<T, A>): SyncFn<Result<T, E>, A>;
    <A extends any[], T>(fn: SyncFn<T, A>, onThrow: ErrorConstructor): SyncFn<Result<T, Error>, A>;
    <A extends any[], T, E = unknown>(fn: SyncFn<T, A>, onThrow: null): SyncFn<Result<T, E>, A>;
    <A extends any[], T, E>(
        fn: SyncFn<T, A>,
        onThrow: (error: unknown) => E,
    ): SyncFn<Result<T, E>, A>;

    <A extends any[], T, E = Error>(fn: AsyncFn<T, A>): AsyncFn<Result<Awaited<T>, E>, A>;
    <A extends any[], T>(
        fn: AsyncFn<T, A>,
        onThrowOrReject: ErrorConstructor,
    ): AsyncFn<Result<Awaited<T>, Error>, A>;
    <A extends any[], T, E = unknown>(
        fn: AsyncFn<T, A>,
        onThrowOrReject: null,
    ): AsyncFn<Result<Awaited<T>, E>, A>;
    <A extends any[], T, E>(
        fn: AsyncFn<T, A>,
        onThrowOrReject: (error: unknown) => E,
    ): AsyncFn<Result<Awaited<T>, E>, A>;
}

export const wrap: Wrap = createWrap(_try);

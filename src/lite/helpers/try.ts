import { createTry } from "@/shared/try";

import { Err } from "./err";
import { Ok } from "./ok";

import type { Result } from "../result";
import type { AsyncFn, SyncFn } from "@/shared/types";

export interface Try {
    <T, E = Error>(fn: SyncFn<T>): Result<T, E>;
    <T>(fn: SyncFn<T>, onThrow: ErrorConstructor): Result<T, Error>;
    <T, E = unknown>(fn: SyncFn<T>, onThrow: null): Result<T, E>;
    <T, E>(fn: SyncFn<T>, onThrow: (error: unknown) => E): Result<T, E>;

    <T, E = Error>(fn: AsyncFn<T>): Promise<Result<Awaited<T>, E>>;
    <T>(fn: AsyncFn<T>, onThrowOrReject: ErrorConstructor): Promise<Result<Awaited<T>, Error>>;
    <T, E = unknown>(fn: AsyncFn<T>, onThrow: null): Promise<Result<Awaited<T>, E>>;
    <T, E>(fn: AsyncFn<T>, onThrowOrReject: (error: unknown) => E): Promise<Result<Awaited<T>, E>>;

    <T, E = Error>(promise: PromiseLike<T>): Promise<Result<Awaited<T>, E>>;
    <T>(promise: PromiseLike<T>, onReject: ErrorConstructor): Promise<Result<Awaited<T>, Error>>;
    <T, E = unknown>(promise: PromiseLike<T>, onReject: null): Promise<Result<Awaited<T>, E>>;
    <T, E>(
        promise: PromiseLike<T>,
        onReject: (error: unknown) => E,
    ): Promise<Result<Awaited<T>, E>>;
}

export const _try: Try = createTry(Ok, Err);

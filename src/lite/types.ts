import type { Result } from "./result";

export type InferOkType<R> = R extends Result<infer T, unknown> ? T : never;
export type InferErrType<R> = R extends Result<unknown, infer E> ? E : never;

export type ExtractOkTypes<T extends readonly Result[]> = {
    [K in keyof T]: InferOkType<T[K]>;
};
export type ExtractErrTypes<T extends readonly Result[]> = {
    [K in keyof T]: InferErrType<T[K]>;
};

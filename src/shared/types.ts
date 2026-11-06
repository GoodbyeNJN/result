export type Fn<Return = any, Args extends readonly any[] = any[]> = (...args: Args) => Return;

export type AsyncFn<Return = any, Args extends readonly any[] = any[]> = (
    ...args: Args
) => PromiseLike<Return>;

export type SyncFn<Return = any, Args extends readonly any[] = any[]> = (
    ...args: Args
) => Return extends PromiseLike<any> ? never : Return;

export const isPromiseLike = (data: unknown): data is PromiseLike<unknown> => {
    return (
        typeof data === "object"
        && data !== null
        // Ensure that the `then` method is not a getter or something else
        && Object.getOwnPropertyDescriptor(data, "then")?.get === undefined
        && typeof (data as any).then === "function"
    );
};

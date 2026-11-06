import { Result } from "../result";

export interface Ok {
    (): Result<void, never>;
    <T>(value: T): Result<T, never>;
}

/* #__NO_SIDE_EFFECTS__ */
export const Ok: Ok = (value?: unknown) => {
    // @ts-expect-error ts(2673)
    return new Result(true, undefined, value);
};

import { Result } from "../result";

export interface Err {
    (): Result<never, void>;
    <E>(error: E): Result<never, E>;
}

/* #__NO_SIDE_EFFECTS__ */
export const Err: Err = (error?: unknown): any => {
    // @ts-expect-error ts(2673)
    return new Result(false, error, undefined);
};

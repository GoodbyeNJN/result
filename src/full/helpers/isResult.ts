import { Result } from "../result";

/* #__NO_SIDE_EFFECTS__ */
export const isResult = (value: unknown): value is Result => {
    return value instanceof Result;
};

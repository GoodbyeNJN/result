import { isPromiseLike } from "@/shared/types";

import { isResult } from "./isResult";
import { Ok } from "./ok";

import type { Result } from "../result";
import type { InferErrType, InferOkType } from "../types";
import type { Fn } from "@/shared/types";

export interface Gen {
    <T, E, This>(
        body: (this: This) => Generator<Result<unknown, E>, Result<T, E> | T>,
        self?: This,
    ): Result<T, E>;
    <YieldErr extends Result, ReturnResult extends Result, This>(
        body: (this: This) => Generator<YieldErr, ReturnResult>,
        self?: This,
    ): Result<
        ReturnResult extends Result ? InferOkType<ReturnResult> : ReturnResult,
        InferErrType<YieldErr> | (ReturnResult extends Result ? InferErrType<ReturnResult> : never)
    >;

    <T, E, This>(
        body: (this: This) => AsyncGenerator<Result<unknown, E>, Result<T, E> | T>,
        self?: This,
    ): Promise<Result<T, E>>;
    <YieldErr extends Result, ReturnResult extends Result, This>(
        body: (this: This) => AsyncGenerator<YieldErr, ReturnResult>,
        self?: This,
    ): Promise<
        Result<
            ReturnResult extends Result ? InferOkType<ReturnResult> : ReturnResult,
            | InferErrType<YieldErr>
            | (ReturnResult extends Result ? InferErrType<ReturnResult> : never)
        >
    >;
}

const handleIteratorResult = (iteratorResult: IteratorResult<any, any>): any => {
    const { done, value } = iteratorResult;

    if (!done) return value;

    return isResult(value) ? value : Ok(value);
};

/* #__NO_SIDE_EFFECTS__ */
export const gen: Gen = (body: Fn<Generator<any> | AsyncGenerator<any>>, self?: any): any => {
    const next = body.call(self).next();
    if (isPromiseLike(next)) {
        return next.then(handleIteratorResult);
    }

    return handleIteratorResult(next);
};

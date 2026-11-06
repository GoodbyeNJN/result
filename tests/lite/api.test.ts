import { expect, expectTypeOf, suite, test } from "vitest";

import { Err, isResult, Ok, Result, ResultWrap } from "@/lite";

suite("Lite Result factories and guards", () => {
    test("creates Ok and Err values and identifies Results", () => {
        const ok = Ok(42);
        const err = Err("Failure");

        expectTypeOf(ok).toEqualTypeOf<Result<number, never>>();
        expectTypeOf(Ok()).toEqualTypeOf<Result<void, never>>();
        expectTypeOf(err).toEqualTypeOf<Result<never, string>>();
        expectTypeOf(Err()).toEqualTypeOf<Result<never, void>>();
        expect(ok.ok).toBe(true);
        expect(ok.value).toBe(42);
        expect(err.ok).toBe(false);
        expect(err.error).toBe("Failure");
        expect(isResult(ok)).toBe(true);
        expect(isResult(err)).toBe(true);
        expect(isResult({ ok: true })).toBe(false);
        expect(isResult(null)).toBe(false);
    });

    test("narrows the Result fields with isOk and isErr", () => {
        const ok: Result<number, string> = Ok(42);
        const err: Result<number, string> = Err("Failure");

        if (ok.isOk()) {
            expectTypeOf(ok.value).toEqualTypeOf<number>();
            expectTypeOf(ok.error).toEqualTypeOf<never>();
        } else {
            throw new Error("Expected Ok");
        }

        if (err.isErr()) {
            expectTypeOf(err.value).toEqualTypeOf<never>();
            expectTypeOf(err.error).toEqualTypeOf<string>();
        } else {
            throw new Error("Expected Err");
        }
    });

    test("iterates over the result fields", () => {
        const ok = Ok(42);
        const err = Err("Failure");

        expect([...ok]).toEqual([true, undefined, 42]);
        expect([...err]).toEqual([false, "Failure", undefined]);
    });
});

suite("ResultWrap", () => {
    test("wraps a function while preserving arguments and return type", () => {
        const wrapped = ResultWrap((left: number, right: number) => left + right);
        const result = wrapped(20, 22);

        expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
        expect(result.ok).toBe(true);
        expect(result.value).toBe(42);
    });

    test("captures thrown errors and supports custom error conversion", () => {
        const wrapped = ResultWrap(
            () => {
                throw new Error("Failure");
            },
            error => `Wrapped: ${error instanceof Error ? error.message : String(error)}`,
        );
        const result = wrapped();

        expect(result.ok).toBe(false);
        expect(result.error).toBe("Wrapped: Failure");
    });

    test("wraps asynchronous functions and captures rejected promises", async () => {
        const wrapped = ResultWrap(async (value: number) => {
            const result = await Promise.resolve(value * 2);
            return result;
        });
        const success = await wrapped(21);
        const failure = await ResultWrap(async () => {
            await Promise.reject(new Error("Failure"));
        })();

        expect(success.ok).toBe(true);
        expect(success.value).toBe(42);
        expect(failure.ok).toBe(false);
        expect(failure.error).toBeInstanceOf(Error);
        expect(failure.error.message).toBe("Failure");
    });
});

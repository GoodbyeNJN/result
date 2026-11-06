import { expect, expectTypeOf, suite, test } from "vitest";

import { Result, ResultWrap } from "@/lite";

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

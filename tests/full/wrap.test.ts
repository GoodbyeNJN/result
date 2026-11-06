import { expect, expectTypeOf, suite, test } from "vitest";

import { Result } from "@/full";

suite("Result.wrap", () => {
    test("wraps a function while preserving arguments and return type", () => {
        const wrapped = Result.wrap((left: number, right: number) => left + right);
        const result = wrapped(20, 22);

        expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
        expect(result.unwrap()).toBe(42);
    });

    test("captures thrown errors and supports custom error conversion", () => {
        const wrapped = Result.wrap(
            () => {
                throw new Error("Failure");
            },
            error => `Wrapped: ${error instanceof Error ? error.message : String(error)}`,
        );

        expect(wrapped().unwrapErr()).toBe("Wrapped: Failure");
    });

    test("wraps asynchronous functions and captures rejected promises", async () => {
        const wrapped = Result.wrap(async (value: number) => {
            const result = await Promise.resolve(value * 2);
            return result;
        });
        const success = await wrapped(21);
        const failure = await Result.wrap(async () => {
            await Promise.reject(new Error("Failure"));
        })();

        expect(success.unwrap()).toBe(42);
        expect(failure.unwrapErr()).toBeInstanceOf(Error);
        expect(failure.unwrapErr().message).toBe("Failure");
    });
});

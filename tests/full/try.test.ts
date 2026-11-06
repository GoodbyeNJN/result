// oxlint-disable typescript/prefer-promise-reject-errors typescript/only-throw-error

import { expect, expectTypeOf, suite, test } from "vitest";

import { Result } from "@/full";

suite("Result.try", () => {
    suite("return Ok ", () => {
        test("sync", () => {
            const result = Result.try(() => {
                return 42;
            });
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        test("async", async () => {
            const result = await Result.try(async () => {
                return Promise.resolve(42);
            });
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });

        test("promise", async () => {
            const result = await Result.try(async () => Promise.resolve(42));
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toBe(42);
        });
    });

    suite("return Err", () => {
        test("sync", () => {
            const result = Result.try(() => {
                throw "Test error";
            });
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(Error);
            expect(result.unwrapErr().message).toBe("Test error");
        });

        test("async", async () => {
            const result = await Result.try(async () => {
                await Promise.resolve();
                throw "Test error";
            });
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(Error);
            expect(result.unwrapErr().message).toBe("Test error");
        });

        test("promise", async () => {
            const result = await Result.try(async () => Promise.reject("Test error"));
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBeInstanceOf(Error);
            expect(result.unwrapErr().message).toBe("Test error");
        });
    });

    suite("return Err with raw thrown data", () => {
        test("sync", () => {
            const result = Result.try(() => {
                throw "Test error";
            }, null);
            expectTypeOf(result).toEqualTypeOf<Result<never, unknown>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).not.toBeInstanceOf(Error);
            expect(result.unwrapErr()).toBe("Test error");
        });

        test("async", async () => {
            const result = await Result.try(async () => {
                await Promise.resolve();
                throw "Test error";
            }, null);
            expectTypeOf(result).toEqualTypeOf<Result<never, unknown>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).not.toBeInstanceOf(Error);
            expect(result.unwrapErr()).toBe("Test error");
        });

        test("promise", async () => {
            const result = await Result.try(async () => Promise.reject("Test error"), null);
            expectTypeOf(result).toEqualTypeOf<Result<never, unknown>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).not.toBeInstanceOf(Error);
            expect(result.unwrapErr()).toBe("Test error");
        });
    });

    suite("return Err with transformed error", () => {
        test("sync", () => {
            const result = Result.try(
                () => {
                    throw "Test error";
                },
                error => `Custom error: ${error as string}`,
            );
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe("Custom error: Test error");
        });

        test("async", async () => {
            const result = await Result.try(
                async () => {
                    await Promise.resolve();
                    throw "Test error";
                },
                error => `Custom error: ${error as string}`,
            );
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe("Custom error: Test error");
        });

        test("promise", async () => {
            const result = await Result.try(
                async () => Promise.reject("Test error"),
                error => `Custom error: ${error as string}`,
            );
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe("Custom error: Test error");
        });
    });
});

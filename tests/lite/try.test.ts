// oxlint-disable typescript/prefer-promise-reject-errors typescript/only-throw-error

import { expect, expectTypeOf, suite, test } from "vitest";

import { Result, ResultTry } from "@/lite";

suite("ResultTry", () => {
    suite("return Ok ", () => {
        test("sync", () => {
            const result = ResultTry(() => {
                return 42;
            });
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
            expect(result.ok).toBe(true);
            expect(result.value).toBe(42);
        });

        test("async", async () => {
            const result = await ResultTry(async () => {
                return Promise.resolve(42);
            });
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
            expect(result.ok).toBe(true);
            expect(result.value).toBe(42);
        });

        test("promise", async () => {
            const result = await ResultTry(async () => Promise.resolve(42));
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
            expect(result.ok).toBe(true);
            expect(result.value).toBe(42);
        });
    });

    suite("return Err", () => {
        test("sync", () => {
            const result = ResultTry(() => {
                throw "Test error";
            });
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
            expect(result.ok).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("Test error");
        });

        test("async", async () => {
            const result = await ResultTry(async () => {
                await Promise.resolve();
                throw "Test error";
            });
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
            expect(result.ok).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("Test error");
        });

        test("promise", async () => {
            const result = await ResultTry(async () => Promise.reject("Test error"));
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
            expect(result.ok).toBe(false);
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe("Test error");
        });
    });

    suite("return Err with raw thrown data", () => {
        test("sync", () => {
            const result = ResultTry(() => {
                throw "Test error";
            }, null);
            expectTypeOf(result).toEqualTypeOf<Result<never, unknown>>();
            expect(result.ok).toBe(false);
            expect(result.error).not.toBeInstanceOf(Error);
            expect(result.error).toBe("Test error");
        });

        test("async", async () => {
            const result = await ResultTry(async () => {
                await Promise.resolve();
                throw "Test error";
            }, null);
            expectTypeOf(result).toEqualTypeOf<Result<never, unknown>>();
            expect(result.ok).toBe(false);
            expect(result.error).not.toBeInstanceOf(Error);
            expect(result.error).toBe("Test error");
        });

        test("promise", async () => {
            const result = await ResultTry(async () => Promise.reject("Test error"), null);
            expectTypeOf(result).toEqualTypeOf<Result<never, unknown>>();
            expect(result.ok).toBe(false);
            expect(result.error).not.toBeInstanceOf(Error);
            expect(result.error).toBe("Test error");
        });
    });

    suite("return Err with transformed error", () => {
        test("sync", () => {
            const result = ResultTry(
                () => {
                    throw "Test error";
                },
                error => `Custom error: ${error as string}`,
            );
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
            expect(result.ok).toBe(false);
            expect(result.error).toBe("Custom error: Test error");
        });

        test("async", async () => {
            const result = await ResultTry(
                async () => {
                    await Promise.resolve();
                    throw "Test error";
                },
                error => `Custom error: ${error as string}`,
            );
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
            expect(result.ok).toBe(false);
            expect(result.error).toBe("Custom error: Test error");
        });

        test("promise", async () => {
            const result = await ResultTry(
                async () => Promise.reject("Test error"),
                error => `Custom error: ${error as string}`,
            );
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
            expect(result.ok).toBe(false);
            expect(result.error).toBe("Custom error: Test error");
        });
    });
});

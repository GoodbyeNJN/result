// oxlint-disable require-yield

import { suite, expect, expectTypeOf, test } from "vitest";

import { Err, Ok, Result } from "@/full";

suite("Result.gen", () => {
    suite("return non-Result value", () => {
        test("sync", () => {
            const value = Result.gen(function* () {
                return 1;
            });
            expectTypeOf(value).toEqualTypeOf<Result<number, unknown>>();
            expect(Result.is(value)).toBe(true);
            expect(value.isOk()).toBe(true);
            expect(value.unwrap()).toBe(1);
        });

        test("async", async () => {
            const value = await Result.gen(async function* () {
                return Promise.resolve(1);
            });
            expectTypeOf(value).toEqualTypeOf<Result<number, unknown>>();
            expect(Result.is(value)).toBe(true);
            expect(value.isOk()).toBe(true);
            expect(value.unwrap()).toBe(1);
        });
    });

    suite("return Result value", () => {
        test("sync", () => {
            const ok = Ok(2);
            const value = Result.gen(function* () {
                return ok;
            });
            expectTypeOf(value).toEqualTypeOf<Result<number, never>>();
            expect(value).toBe(ok);

            const err = Err("error");
            const error = Result.gen(function* () {
                return err;
            });
            expectTypeOf(error).toEqualTypeOf<Result<never, string>>();
            expect(error).toBe(err);
        });

        test("async", async () => {
            const ok = Ok(2);
            const value = await Result.gen(async function* () {
                return Promise.resolve(ok);
            });
            expectTypeOf(value).toEqualTypeOf<Result<number, never>>();
            expect(value).toBe(ok);

            const err = Err("error");
            const error = await Result.gen(async function* () {
                return Promise.resolve(err);
            });
            expectTypeOf(error).toEqualTypeOf<Result<never, string>>();
            expect(error).toBe(err);
        });
    });

    suite("propagate yielded Err values", () => {
        test("sync", () => {
            let completed = false;
            const result = Result.gen(function* () {
                const value = yield* Ok(1);
                yield* Err("Failure");
                completed = true;
                return value;
            });

            expectTypeOf(result.unwrapErr()).toEqualTypeOf<string>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe("Failure");
            expect(completed).toBe(false);
        });

        test("async", async () => {
            let completed = false;
            const result = await Result.gen(async function* () {
                const value = yield* Ok(1);
                yield* Err("Failure");
                completed = true;
                return Promise.resolve(value);
            });

            expectTypeOf(result.unwrapErr()).toEqualTypeOf<string>();
            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toBe("Failure");
            expect(completed).toBe(false);
        });
    });
});

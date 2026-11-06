import { inspect } from "node:util";

import { expect, expectTypeOf, suite, test } from "vitest";

import { Err, Ok, Result, ResultError, isResult } from "@/full";

suite("Result factories and guards", () => {
    test("creates Ok and Err values and identifies Results", () => {
        const ok = Ok(42);
        const err = Err("Failure");

        expectTypeOf(ok).toEqualTypeOf<Result<number, never>>();
        expectTypeOf(Ok()).toEqualTypeOf<Result<void, never>>();
        expectTypeOf(err).toEqualTypeOf<Result<never, string>>();
        expectTypeOf(Err()).toEqualTypeOf<Result<never, void>>();
        expect(ok.isOk()).toBe(true);
        expect(ok.isErr()).toBe(false);
        expect(err.isOk()).toBe(false);
        expect(err.isErr()).toBe(true);
        expect(Result.is(ok)).toBe(true);
        expect(isResult(err)).toBe(true);
        expect(Result.is({ ok: true })).toBe(false);
        expect(isResult(null)).toBe(false);
    });

    test("narrows Result types with predicates", () => {
        const ok: Result<number, string> = Ok(42);
        const err: Result<number, string> = Err("Failure");

        if (ok.isOkAnd(value => value > 0)) {
            expect(ok.unwrap()).toBe(42);
        } else {
            throw new Error("Expected a positive Ok value");
        }

        if (err.isErrAnd(error => error === "Failure")) {
            expect(err.unwrapErr()).toBe("Failure");
        } else {
            throw new Error("Expected the matching Err value");
        }

        expect(Ok(-1).isOkAnd(value => value > 0)).toBe(false);
        expect(Err("other").isErrAnd(error => error === "Failure")).toBe(false);
    });
});

suite("Result mapping and composition", () => {
    test("maps Ok values and preserves Err values", () => {
        const ok: Result<number, string> = Ok(2);
        const mapped = ok.map(value => value * 3);
        const err: Result<number, string> = Err("Failure");

        expectTypeOf(mapped).toEqualTypeOf<Result<number, string>>();
        expect(mapped.unwrap()).toBe(6);
        expect(err.map(value => value * 3)).toBe(err);
    });

    test("maps Err values and preserves Ok values", () => {
        const err: Result<number, string> = Err("Failure");
        const mapped = err.mapErr(error => error.length);
        const ok: Result<number, string> = Ok(2);

        expectTypeOf(mapped).toEqualTypeOf<Result<number, number>>();
        expect(mapped.unwrapErr()).toBe(7);
        expect(ok.mapErr(error => error.length)).toBe(ok);
    });

    test("and returns its argument only for Ok", () => {
        const next: Result<string, string> = Ok("next");
        const source: Result<number, string> = Ok(1);
        const ok = source.and(next);
        const err: Result<number, string> = Err("Failure");
        const typedNext: Result<number, string> = Ok(2);

        expectTypeOf(ok).toEqualTypeOf<Result<string, string>>();
        expect(ok).toBe(next);
        expect(err.and(typedNext)).toBe(err);
    });

    test("andThen runs only for Ok", () => {
        let calls = 0;
        const ok = Ok(2).andThen(value => {
            calls++;
            return Ok(String(value));
        });
        const err: Result<number, string> = Err("Failure");
        const shortCircuited = err.andThen(value => {
            calls++;
            return Ok(String(value));
        });

        expectTypeOf(ok).toEqualTypeOf<Result<string, never>>();
        expect(ok.unwrap()).toBe("2");
        expect(shortCircuited).toBe(err);
        expect(calls).toBe(1);
    });

    test("or returns its argument only for Err", () => {
        const fallback: Result<number, string> = Ok(42);
        const err: Result<number, string> = Err("Failure");
        const recovered = err.or(fallback);
        const ok: Result<number, string> = Ok(1);
        const typedFallback: Result<number, string> = Ok(42);

        expectTypeOf(recovered).toEqualTypeOf<Result<number, string>>();
        expect(recovered).toBe(fallback);
        expect(ok.or(typedFallback)).toBe(ok);
    });

    test("orElse runs only for Err", () => {
        let calls = 0;
        const err: Result<number, string> = Err("Failure");
        const recovered = err.orElse(error => {
            calls++;
            return Ok(error.length);
        });
        const ok: Result<number, string> = Ok(42);
        const shortCircuited = ok.orElse(error => {
            calls++;
            return Ok(error.length);
        });

        expectTypeOf(recovered).toEqualTypeOf<Result<number, never>>();
        expect(recovered.unwrap()).toBe(7);
        expect(shortCircuited).toBe(ok);
        expect(calls).toBe(1);
    });

    test("unwraps with defaults and matches the active branch", () => {
        const ok = Ok(42);
        const err = Err("Failure");

        expect(ok.unwrapOr(0)).toBe(42);
        expect(err.unwrapOr(0)).toBe(0);
        expect(ok.unwrapOrElse(() => 0)).toBe(42);
        expect(err.unwrapOrElse(error => error.length)).toBe(7);
        expect(
            ok.match(
                value => value * 2,
                () => 0,
            ),
        ).toBe(84);
        expect(
            err.match(
                () => 0,
                error => error.length,
            ),
        ).toBe(7);
    });
});

suite("Result inspection and iteration", () => {
    test("inspects only the matching branch and returns the original Result", () => {
        const ok = Ok(42);
        const err = Err("Failure");
        const seen: unknown[] = [];

        expect(ok.inspect(value => seen.push(value))).toBe(ok);
        expect(ok.inspectErr(error => seen.push(error))).toBe(ok);
        expect(err.inspect(value => seen.push(value))).toBe(err);
        expect(err.inspectErr(error => seen.push(error))).toBe(err);
        expect(seen).toEqual([42, "Failure"]);

        expect(
            ok.inspect(() => {
                throw new Error("Ignored inspection error");
            }),
        ).toBe(ok);
        expect(
            err.inspectErr(() => {
                throw new Error("Ignored inspection error");
            }),
        ).toBe(err);
    });

    test("iter exposes the variant fields and tuple values", () => {
        const ok = Ok(42).iter();
        const err = Err("Failure").iter();

        expect(ok).toMatchObject({ ok: true, value: 42 });
        expect([...ok]).toEqual([true, undefined, 42]);
        expect(err).toMatchObject({ ok: false, error: "Failure" });
        expect([...err]).toEqual([false, "Failure", undefined]);
    });

    test("Result iteration returns Ok values and yields Err values", () => {
        const ok = Ok(42);
        const err = Err("Failure");
        const generator = function* () {
            const value = yield* ok;
            return value;
        };
        const errorGenerator = function* () {
            yield* err;
        };

        expect(generator().next()).toEqual({ done: true, value: 42 });
        expect(errorGenerator().next()).toEqual({ done: false, value: err });
    });

    test("adds error context and formats ResultError", () => {
        const result = Err(new Error("Root cause"))
            .context("Outer context")
            .context("Inner context");
        let thrown: unknown;

        try {
            result.unwrap(null);
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(ResultError);
        expect((thrown as ResultError).formatted.message).toBe("Inner context");
        expect((thrown as ResultError).formatted.contexts).toEqual(["Outer context", "Root cause"]);
        expect(ResultError.is(thrown)).toBe(true);
        expect(ResultError.fmt(result)).toContain("Inner context");
        expect(() => result.unwrap("Custom message")).toThrow("Custom message");
        expect(() => result.unwrap(null)).toThrow("Inner context");
        expect(() => Ok(1).unwrapErr()).toThrow(ResultError);
    });

    test("custom inspection formats Ok, Error Err, and raw Err values", () => {
        expect(inspect(Ok(42))).toBe("Ok(42)");
        expect(inspect(Err(new TypeError("Failure")))).toContain("Err(TypeError(");
        expect(inspect(Err("Failure"))).toContain("Failure");
    });
});

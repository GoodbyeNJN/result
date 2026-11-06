import { expect, expectTypeOf, suite, test } from "vitest";

import { Err, Ok, Result } from "@/full";

suite("Result.all", () => {
    test("combines successful values and infers tuple types", () => {
        const inputs: [Result<number, never>, Result<string, never>] = [Ok(1), Ok("two")];
        const result = Result.all(inputs);

        expectTypeOf(result.unwrap()).toEqualTypeOf<[number, string]>();
        expect(result.unwrap()).toEqual([1, "two"]);
    });

    test("returns the first error", () => {
        const result = Result.all([Ok(1), Err("first"), Err("second")] as const);

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe("first");
    });

    test("combines an empty array", () => {
        const result = Result.all([]);

        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([]);
    });
});

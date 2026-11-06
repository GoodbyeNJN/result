import { expect, suite, test } from "vitest";

import { Err, Ok } from "@/full";

suite("Result basics", () => {
    test("unwraps the matching variant", () => {
        expect(Ok(42).unwrap()).toBe(42);
        expect(Err("Failure").unwrapErr()).toBe("Failure");
    });
});

import { Err } from "./err";
import { Ok } from "./ok";

import type { Result } from "../result";
import type { ResultAll } from "../types";

export interface All {
    <T extends readonly [Result, ...Result[]]>(results: T): ResultAll<T>;
    <T extends readonly Result[]>(results: T): ResultAll<T>;
}

/* #__NO_SIDE_EFFECTS__ */
export const all: All = (results: Result[]): ResultAll<Result[]> => {
    const values: unknown[] = [];

    for (const result of results) {
        if (result.isErr()) {
            return Err(result["error"]);
        }

        values.push(result["value"]);
    }

    return Ok(values);
};

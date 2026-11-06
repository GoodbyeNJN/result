# @goodbyenjn/result

A lightweight TypeScript `Result<T, E>` implementation for representing success and failure with `Ok` and `Err`. It supports synchronous and asynchronous error handling and provides both a full-featured and a minimal entry point.

## Installation

```bash
pnpm add @goodbyenjn/result
```

You can also install it with npm or Yarn.

## Choose an entry point

- `@goodbyenjn/result`: The full entry point, with chainable methods, `Result.gen`, `Result.all`, error contexts, and `ResultError`.
- `@goodbyenjn/result/lite`: The minimal entry point. It exports `Result`, `Ok`, `Err`, `isResult`, `ResultTry`, and `ResultWrap`. Lite result instances expose `ok`, `error`, and `value` properties, plus `isOk()` and `isErr()` type guards.

```ts
import { Err, Ok, Result } from "@goodbyenjn/result";
```

For the lite entry point:

```ts
import { Err, Ok, Result } from "@goodbyenjn/result/lite";
```

## Basic usage

```ts
import { Err, Ok, Result } from "@goodbyenjn/result";

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) return Err("Division by zero");
    return Ok(a / b);
}

const result = divide(10, 2);

if (result.isOk()) {
    console.log(result.unwrap()); // 5
} else {
    console.error(result.unwrapErr());
}
```

`Ok(value)` creates a successful result, and `Err(error)` creates a failed result. Calling either without an argument produces `Ok<void, never>` or `Err<never, void>`, respectively.

## Catching errors

Both entry points can turn synchronous or asynchronous work into a `Result`. The full entry point uses `Result.try`; the lite entry point exports the same helper as `ResultTry`. Each accepts a function or a Promise-like value, returns `Ok` on success, and returns `Err` if the function throws or the promise rejects. By default, thrown values are normalized to `Error` instances.

```ts
const result = Result.try(() => JSON.parse('{"ok":true}'));

const asyncResult = await Result.try(() => fetch("/api/data"));
```

With the lite entry point:

```ts
import { ResultTry } from "@goodbyenjn/result/lite";

const result = ResultTry(() => JSON.parse('{"ok":true}'));
const asyncResult = await ResultTry(() => fetch("/api/data"));
```

Pass a second argument to customize error handling. Use a callback to transform the thrown value, or `null` to preserve it:

```ts
const result = Result.try(
    () => {
        throw new Error("Request failed");
    },
    error => `Failed to load data: ${String(error)}`,
);

const rawErrorResult = Result.try(() => {
    throw "Original error";
}, null);
```

## Wrapping functions

`Result.wrap` in the full entry point and `ResultWrap` in the lite entry point wrap a function so that its return value becomes `Ok` and thrown errors or rejected promises become `Err`. Function parameters and return types are preserved.

```ts
const parseJson = Result.wrap((text: string) => JSON.parse(text));

const parsed = parseJson('{"count":1}'); // Result<unknown, Error>
```

The lite equivalent is `ResultWrap`. Both helpers support asynchronous functions and the same error transformation options as their `try` counterpart.

## Full entry point

The full entry point adds mapping and composition, `Result.all`, `Result.gen`, error contexts, and `ResultError`. Its mapping and composition callbacks (`map`, `mapErr`, `andThen`, and `orElse`) are synchronous. For asynchronous work, use `Result.try` or `Result.wrap` and await the resulting `Promise<Result>` before continuing with synchronous Result methods:

```ts
const loaded = await Result.try(() => loadData());

const result = loaded
    .map(value => value * 3)
    .andThen(value => (value > 5 ? Ok(value) : Err("Value is too small")));

const message = result.match(
    value => `Success: ${value}`,
    error => `Failure: ${error}`,
);
```

Common instance methods:

| Method                                       | Description                                                           |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `isOk()` / `isErr()`                         | Check the result variant and narrow its type                          |
| `isOkAnd(predicate)` / `isErrAnd(predicate)` | Check the variant and test its value or error                         |
| `map(fn)` / `mapErr(fn)`                     | Map the success value or error                                        |
| `and(result)` / `andThen(fn)`                | Continue composing results on success                                 |
| `or(result)` / `orElse(fn)`                  | Provide a fallback result on failure                                  |
| `match(ok, err)`                             | Handle the success and failure branches                               |
| `unwrap()` / `unwrapErr()`                   | Extract the value; throw `ResultError` if called on the wrong variant |
| `unwrapOr(value)` / `unwrapOrElse(fn)`       | Use a fallback value on failure                                       |
| `inspect(fn)` / `inspectErr(fn)`             | Inspect the current branch and return the original result             |
| `iter()`                                     | Return an iterable tuple-like view of the result                      |
| `context(text)`                              | Add error context, which is included when `unwrap` throws             |

Use `isOk()` and `isErr()` for type narrowing. Calling `unwrap()` on an `Err` or `unwrapErr()` on an `Ok` throws `ResultError`. To avoid exception-based control flow, use `match`, a type guard, or `unwrapOr`.

## Combining results

`Result.all` returns an `Ok` containing all values when every result is successful. It returns the first encountered `Err` otherwise:

```ts
const results: [Result<number, never>, Result<string, never>] = [Ok(1), Ok("two")];
const combined = Result.all(results); // Result<[number, string], never>
```

## Generator workflows

Use `yield*` in a generator passed to `Result.gen` to propagate `Err` values without manually checking each step. The generator's final return value is automatically wrapped in `Ok`; if it is already a `Result`, that result is returned directly. Async generators are also supported.

```ts
const result = Result.gen(function* () {
    const userId = yield* Ok(42);
    const name = yield* userId > 0 ? Ok("Ada") : Err("Invalid user");
    return name;
});
```

## Lite entry point

The lite entry point does not include the full entry point's mapping/composition methods, `Result.gen`, `Result.all`, or `ResultError`. It exports `ResultTry` and `ResultWrap` as standalone functions, not as static methods on `Result`. Use `isResult` to check whether a value is a result. Use `isOk()` and `isErr()` to narrow the result before accessing its fields:

```ts
import { Err, Ok, ResultTry, ResultWrap, isResult } from "@goodbyenjn/result/lite";

const result = ResultTry(() => 42);

if (result.isOk()) {
    console.log(result.value);
}

if (result.isErr()) {
    console.error(result.error);
}

const failure = Err("Something went wrong");
console.log(failure.error);

const parseJson = ResultWrap((text: string) => JSON.parse(text));
const parsed = parseJson('{"count":1}');

console.log(isResult(result)); // true
```

## Type exports

The full entry point exports `Result`, `Ok`, `Err`, `isResult`, `ResultError`, and the types `All`, `Gen`, `Try`, `Wrap`, `ExtractErrTypes`, `ExtractOkTypes`, `InferErrType`, and `InferOkType`. The lite entry point exports `Result`, `Ok`, `Err`, `isResult`, `ResultTry`, `ResultWrap`, and the types `Try`, `Wrap`, `ExtractErrTypes`, `ExtractOkTypes`, `InferErrType`, and `InferOkType`.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm check
```

import { getErrorMessage } from "@/shared/error";

import { Result } from "../result";

const prepare = (result: Result, msg?: string) => {
    // 1. Determine error message and cause from the provided error
    const cause = result["error"];

    // 2. Concat error message to contexts as the innermost context
    const contexts: string[] = [
        ...(cause === undefined ? [] : [getErrorMessage(cause)]),
        ...result["contexts"],
    ].reverse();

    let message = "";
    // 3. Use provided message as the main message if available
    if (msg) {
        message = msg;
    } else {
        // 4. Otherwise, use the first non-empty context as the main message
        while (contexts.length > 0) {
            // 5. The main message is removed from contexts
            message = contexts.shift()!;
            if (message) break;
        }
        // 6. The main message may still be empty, that's okay
    }

    // 7. Format into a string with message and contexts
    const ctx = contexts.map((line, index) => `    ${index}: ${line}`).join("\n");
    const output = `
Message:
    ${message || "<empty message>"}
Context:
    ${ctx.trim() || "<empty context>"}
`.trim();

    // 8. Prepare the error constructor options
    const options: ErrorOptions | undefined = cause instanceof Error ? { cause } : undefined;

    return { message, contexts, output, options };
};

export class ResultError extends Error {
    static is(value: unknown): value is ResultError {
        return value instanceof ResultError;
    }

    static fmt(result: Result, message?: string): string {
        return prepare(result, message).output;
    }

    readonly formatted: {
        message: string;
        contexts: string[];
        output: string;
    };

    // oxlint-disable-next-line typescript/no-unsafe-function-type
    constructor(result: Result, message?: string, caller: Function = ResultError) {
        const prepared = prepare(result, message);

        super(
            `
${"-".repeat(20)}
${prepared.output}
Stack trace:`,
            prepared.options,
        );
        Error.captureStackTrace(this, caller || this.constructor);

        this.name = "ResultError";

        this.formatted = {
            message: prepared.message,
            contexts: prepared.contexts,
            output: prepared.output,
        };
    }

    override toString(): string {
        return `${this.name}
${"-".repeat(20)}
${this.formatted.output}`;
    }

    // See `Inspectable` and `inspect` types in `node:util` for details
    [Symbol.for("nodejs.util.inspect.custom")](): string {
        return this.toString();
    }
}

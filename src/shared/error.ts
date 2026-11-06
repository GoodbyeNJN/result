/* #__NO_SIDE_EFFECTS__ */
// oxlint-disable-next-line typescript/no-unsafe-function-type
export const normalizeError = (error: unknown, caller?: Function): Error => {
    if (error instanceof Error) return error;

    const e = new Error(getErrorMessage(error));
    if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(e, caller || normalizeError);
    }

    return e;
};

/* #__NO_SIDE_EFFECTS__ */
export const getErrorMessage = (error: unknown, defaultMessage?: string): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;

    if (typeof error === "number" || typeof error === "boolean" || typeof error === "symbol") {
        return error.toString();
    }
    if (typeof error === "bigint") {
        return error.toString() + "n";
    }

    // Fallback to default message for undefined and null
    if (error === undefined) return defaultMessage ?? "<undefined>";
    if (error === null) return defaultMessage ?? "<null>";

    if (typeof error === "object") {
        if (typeof (error as any).message === "string") {
            return (error as any).message;
        }

        try {
            return JSON.stringify(error);
        } catch {}
    }

    // Fallback to default message for other non-primitive types
    return defaultMessage ?? Object.prototype.toString.call(error);
};

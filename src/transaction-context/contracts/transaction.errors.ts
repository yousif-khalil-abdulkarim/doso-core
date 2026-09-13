/**
 * @module TransactionContext
 */

/**
 * The error is thrown when an invocable is run with `TRANSACTION_PROPAGATION.MANDATORY`
 * propagation (or `getTransactionOrFail()` is called) while no transaction is currently
 * active.
 *
 * IMPORT_PATH: `"eridu-tech/transaction-context/contracts"`
 * @group Errors
 */
export class MandatoryPropagationError extends Error {
    static create(cause?: unknown): MandatoryPropagationError {
        return new MandatoryPropagationError(
            `Cannot run with transaction propagation "MANDATORY" when no transaction is active`,
            cause,
        );
    }

    /**
     * Note: Do not instantiate `MandatoryPropagationError` directly via the constructor. Use the static `create()` factory method instead.
     * The constructor remains public only to maintain compatibility with errorPolicy types and prevent type errors.
     * @internal
     */
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = MandatoryPropagationError.name;
    }
}

/**
 * The error is thrown when an invocable is run with `TRANSACTION_PROPAGATION.NEVER`
 * propagation while a transaction is currently active.
 *
 * IMPORT_PATH: `"eridu-tech/transaction-context/contracts"`
 * @group Errors
 */
export class NeverPropagationError extends Error {
    static create(cause?: unknown): NeverPropagationError {
        return new NeverPropagationError(
            `Cannot run with transaction propagation "NEVER" while a transaction is active`,
            cause,
        );
    }

    /**
     * Note: Do not instantiate `NeverPropagationError` directly via the constructor. Use the static `create()` factory method instead.
     * The constructor remains public only to maintain compatibility with errorPolicy types and prevent type errors.
     * @internal
     */
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = NeverPropagationError.name;
    }
}

/**
 * The error is thrown when starting a transaction fails.
 *
 * IMPORT_PATH: `"eridu-tech/transaction-context/contracts"`
 * @group Errors
 */
export class StartTransactionError extends Error {
    static create(cause?: unknown): StartTransactionError {
        return new StartTransactionError(
            `Failed to start a transaction`,
            cause,
        );
    }

    /**
     * Note: Do not instantiate `StartTransactionError` directly via the constructor. Use the static `create()` factory method instead.
     * The constructor remains public only to maintain compatibility with errorPolicy types and prevent type errors.
     * @internal
     */
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = StartTransactionError.name;
    }
}

/**
 * The error is thrown when committing a transaction fails.
 *
 * IMPORT_PATH: `"eridu-tech/transaction-context/contracts"`
 * @group Errors
 */
export class CommitTransactionError extends Error {
    static create(cause?: unknown): CommitTransactionError {
        return new CommitTransactionError(
            `Failed to commit the transaction`,
            cause,
        );
    }

    /**
     * Note: Do not instantiate `CommitTransactionError` directly via the constructor. Use the static `create()` factory method instead.
     * The constructor remains public only to maintain compatibility with errorPolicy types and prevent type errors.
     * @internal
     */
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CommitTransactionError.name;
    }
}

/**
 * The error is thrown when aborting a transaction fails.
 *
 * IMPORT_PATH: `"eridu-tech/transaction-context/contracts"`
 * @group Errors
 */
export class AbortTransactionError extends Error {
    static create(cause?: unknown): AbortTransactionError {
        return new AbortTransactionError(
            `Failed to abort the transaction`,
            cause,
        );
    }

    /**
     * Note: Do not instantiate `AbortTransactionError` directly via the constructor. Use the static `create()` factory method instead.
     * The constructor remains public only to maintain compatibility with errorPolicy types and prevent type errors.
     * @internal
     */
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = AbortTransactionError.name;
    }
}

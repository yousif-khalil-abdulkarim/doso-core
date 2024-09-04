/**
 * @group Errors
 */
export class KeyValueStorageError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeyValueStorageError.name;
    }
}

/**
 * @group Errors
 */
export class UnexpectedKeyValueStorageError extends KeyValueStorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedKeyValueStorageError.name;
    }
}

/**
 * @group Errors
 */
export class KeysNotFoundKeyValueStorageError extends KeyValueStorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeysNotFoundKeyValueStorageError.name;
    }
}

/**
 * @group Errors
 */
export class KeysAlreadyExistKeyValueStorageError extends KeyValueStorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeysAlreadyExistKeyValueStorageError.name;
    }
}

/**
 * @group Errors
 */
export class TypeKeyValueStorageError extends KeyValueStorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeKeyValueStorageError.name;
    }
}

export type ClampSettings = {
    min?: number;
    max?: number;
};

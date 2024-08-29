/**
 * @module Storages
 */

import {
    type IterableRecord,
    type AsyncIterableValue,
    type AsyncLazyable,
    type RecordItem,
} from "@/_shared/types";

/**
 * @group Errors
 */
export class StorageError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = StorageError.name;
    }
}

/**
 * @group Errors
 */
export class UnexpectedStorageError extends StorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedStorageError.name;
    }
}

/**
 * @group Errors
 */
export class KeysNotFoundStorageError extends StorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeysNotFoundStorageError.name;
    }
}

/**
 * @group Errors
 */
export class KeysAlreadyExistStorageError extends StorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = KeysAlreadyExistStorageError.name;
    }
}

/**
 * @group Errors
 */
export class TypeStorageError extends StorageError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = TypeStorageError.name;
    }
}

export type StorageKey = string | number;
export type IterableOrRecord<TKey extends string | number, TValue> =
    | AsyncIterableValue<RecordItem<TKey, TValue>>
    | Record<TKey, TValue>;

export type ClampSettings = {
    min?: number;
    max?: number;
};
type Abra = {
    stream?: boolean;
    keyPrefix?: string;
};
export type HasManySettings = Abra & {
    keys: AsyncIterableValue<StorageKey>;
};
export type GetManySettings = Abra & {
    keys: AsyncIterableValue<StorageKey>;
};

export type GetManyAndRemoveSettings = Abra & {
    keys: AsyncIterableValue<StorageKey>;
};

export const STORAGE_VALUES = {
    MULTIPLE: "multiple-values",
    SINGLE: "single-value",
} as const;
export type StorageValue = (typeof STORAGE_VALUES)[keyof typeof STORAGE_VALUES];

export type GetManyOrInsertSettingsSingle<TExtended> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    insertValue: AsyncLazyable<TExtended>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type GetManyOrInsertSettingsMultiple<TExtended> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    items: IterableOrRecord<StorageKey, AsyncLazyable<TExtended>>;
    keyPrefix?: string;
};
export type GetManyOrInsertSettings<TExtended> =
    | GetManyOrInsertSettingsMultiple<TExtended>
    | GetManyOrInsertSettingsSingle<TExtended>;

export type GetManyOrSettingsSingle<TExtended> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    defaultValue: AsyncLazyable<TExtended>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type GetManyOrSettingsMultiple<TExtended> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    items: IterableOrRecord<StorageKey, AsyncLazyable<TExtended>>;
    keyPrefix?: string;
};
export type GetManyOrSettings<TExtended> =
    | GetManyOrSettingsMultiple<TExtended>
    | GetManyOrSettingsSingle<TExtended>;

export type InsertManyIfNotExistsSettingsSingle<TValue> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["SINGLE"];
    insertValue: AsyncLazyable<TValue>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type InsertManyIfNotExistsSettingsMultiple<TValue> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    items: IterableOrRecord<StorageKey, AsyncLazyable<TValue>>;
    keyPrefix?: string;
};
export type InsertManyIfNotExistsSettings<TValue> =
    | InsertManyIfNotExistsSettingsMultiple<TValue>
    | InsertManyIfNotExistsSettingsSingle<TValue>;

export type UpdateManyIfNotExistsSettingsSingle<TValue> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["SINGLE"];
    updateValue: AsyncLazyable<TValue>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type UpdateManyIfNotExistsSettingsMultiple<TValue> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    items: IterableOrRecord<StorageKey, AsyncLazyable<TValue>>;
    keyPrefix?: string;
};
export type UpdateManyIfNotExistsSettings<TValue> =
    | UpdateManyIfNotExistsSettingsMultiple<TValue>
    | UpdateManyIfNotExistsSettingsSingle<TValue>;

export type IncrementManyIfNotExistsSettingsSingle = ClampSettings & {
    type: (typeof STORAGE_VALUES)["SINGLE"];
    updateValue: AsyncLazyable<number>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type IncrementManyIfNotExistsSettingsMultiple = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    items: IterableOrRecord<StorageKey, AsyncLazyable<number>>;
    keyPrefix?: string;
};
export type IncrementManyIfNotExistsSettings =
    | IncrementManyIfNotExistsSettingsMultiple
    | IncrementManyIfNotExistsSettingsSingle;

export type DecrementManyIfNotExistsSettingsSingle = ClampSettings & {
    type: (typeof STORAGE_VALUES)["SINGLE"];
    updateValue: AsyncLazyable<number>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type DecrementManyIfNotExistsSettingsMultiple = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    items: IterableOrRecord<StorageKey, AsyncLazyable<number>>;
    keyPrefix?: string;
};
export type DecrementManyIfNotExistsSettings =
    | DecrementManyIfNotExistsSettingsMultiple
    | DecrementManyIfNotExistsSettingsSingle;

export type InsertOrUpdateManySettingsSingle<TValue> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["SINGLE"];
    insertValue: AsyncLazyable<TValue>;
    updateValue: AsyncLazyable<TValue>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type InsertOrUpdateManySettingsMultiple<TValue> = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    insertValue: AsyncLazyable<TValue>;
    items: IterableOrRecord<StorageKey, AsyncLazyable<TValue>>;
    keyPrefix?: string;
};
export type InsertOrUpdateManySettings<TValue> =
    | InsertOrUpdateManySettingsMultiple<TValue>
    | InsertOrUpdateManySettingsSingle<TValue>;

export type InsertOrIncrementManySettingsSingle = ClampSettings & {
    type: (typeof STORAGE_VALUES)["SINGLE"];
    insertValue: AsyncLazyable<number>;
    updateValue: AsyncLazyable<number>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type InsertOrIncrementManySettingsMultiple = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    insertValue: AsyncLazyable<number>;
    items: IterableOrRecord<StorageKey, AsyncLazyable<number>>;
    keyPrefix?: string;
};
export type InsertOrIncrementManySettings =
    | InsertOrIncrementManySettingsMultiple
    | InsertOrIncrementManySettingsSingle;

export type InsertOrDecrementManySettingsSingle = ClampSettings & {
    type: (typeof STORAGE_VALUES)["SINGLE"];
    insertValue: AsyncLazyable<number>;
    updateValue: AsyncLazyable<number>;
    keys: AsyncIterableValue<StorageKey>;
    keyPrefix?: string;
};
export type InsertOrDecrementManySettingsMultiple = ClampSettings & {
    type: (typeof STORAGE_VALUES)["MULTIPLE"];
    insertValue: AsyncLazyable<number>;
    items: IterableOrRecord<StorageKey, AsyncLazyable<number>>;
    keyPrefix?: string;
};
export type InsertOrDecrementManySettings =
    | InsertOrDecrementManySettingsMultiple
    | InsertOrDecrementManySettingsSingle;

/**
 * <i>IStorage</i> is Key Value storage adapter.
 * @group Contracts
 */
export type IStorage<TValue = unknown> = AsyncIterable<
    RecordItem<StorageKey, TValue>
> & {
    /**
     * The <i>values</i> method returns all values.
     */
    values(): AsyncIterator<TValue>;

    /**
     * The <i>keys</i> method returns all keys.
     */
    keys(): AsyncIterator<StorageKey>;

    /**
     * The <i>entries</i> method returns all key value pairs.
     */
    entries(): AsyncIterator<RecordItem<StorageKey, TValue>>;

    /**
     * The <i>clear</i> method removes all keys.
     */
    clear(): Promise<void>;

    /**
     * The <i>isEmpty</i> method return true if storage is empty
     */
    isEmpty(): Promise<boolean>;

    /**
     * The <i>isNotEmpty</i> method return true if storage is not empty
     */
    isNotEmpty(): Promise<boolean>;

    /**
     * The <i>has</i> method checks if an <i>key</i> exists. If the <i>key</i> exists true is returned.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    has(key: StorageKey): Promise<boolean>;

    /**
     * The <i>hasMany</i> method checks if multiple keys exists. The keys that exists will be true.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    hasMany(key: HasManySettings): Promise<IterableRecord<StorageKey, boolean>>;

    /**
     * The <i>get</i> method returns the value if the <i>key</i> exists otherwise null will be returned.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    get(key: StorageKey): Promise<TValue | null>;

    /**
     * The <i>getMany</i> method returns multiple values. The keys that do not exists will be null.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    getMany(
        settings: GetManySettings,
    ): Promise<IterableRecord<StorageKey, TValue | null>>;

    /**
     * The <i>getOr</i> method returns the value if the <i>key</i> exists otherwise <i>defaultValue</i> will be returned.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    getOr<TExtended>(
        key: StorageKey,
        defaultValue: AsyncLazyable<TExtended>,
    ): Promise<TValue | TExtended>;

    /**
     * The <i>getManyOr</i> method returns multiple values. The keys that do not exists will be <i>defaultValue</i>.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    getManyOr<TExtended>(
        settings: GetManyOrSettings<TExtended>,
    ): Promise<IterableRecord<StorageKey, TValue | TExtended>>;

    /**
     * The <i>getOrFail</i> method returns the value if the <i>key</i> exists otherwise an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {KeysNotFoundStorageError}
     */
    getOrFail(key: StorageKey): Promise<TValue>;

    /**
     * The <i>getAndRemove</i> method returns the value and removes the <i>key</i> if it exists otherwise null will be returned.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    getAndRemove(key: StorageKey): Promise<TValue | null>;

    /**
     * The <i>getManyAndRemove</i> method returns multiple values. The keys that do exists will be removed and keys do not exists will be null.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    getManyAndRemove(
        settings: GetManyAndRemoveSettings,
    ): Promise<IterableRecord<StorageKey, TValue | null>>;

    /**
     * The <i>getOrInsert</i> method returns the value if <i>key</i> exists otherwise <i>insertValue</i> will be inserted and then returned.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    getOrInsert(
        key: StorageKey,
        insertValue: AsyncLazyable<TValue>,
    ): Promise<TValue>;

    /**
     * The <i>getManyOrInsert</i> method returns a multiple values. The keys that do not exists will be inserted and then returned.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    getManyOrInsert(
        settings: GetManyOrInsertSettings<TValue>,
    ): Promise<IterableRecord<StorageKey, TValue>>;

    /**
     * The <i>getManyStartsWith</i> method returns multiple items where the keys starts with <i>keyPrefix</i>
     */
    getManyStartsWith(
        keyPrefix: string,
    ): AsyncIterable<RecordItem<StorageKey, TValue>>;

    /**
     * The <i>getManyEndsWith</i> method returns multiple items where the keys starts with <i>keySuffix</i>
     */
    getManyEndsWith(
        keySuffix: string,
    ): AsyncIterable<RecordItem<StorageKey, TValue>>;

    /**
     * The <i>getManyIncludes</i> method returns multiple items where the keys include with <i>key</i>
     */
    getManyIncludes(key: string): AsyncIterable<RecordItem<StorageKey, TValue>>;

    /**
     * The <i>insert</i> method inserts an item in store. If the key already exists an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {KeysAlreadyExistStorageError}
     */
    insert(key: StorageKey, insertValue: AsyncLazyable<TValue>): Promise<void>;

    /**
     * The <i>insertIfNotExist</i> method inserts an item when the <i>key</i> do not exist.
     * The method returns true when item is inserted.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    insertIfNotExist(
        key: StorageKey,
        insertValue: AsyncLazyable<TValue>,
    ): Promise<boolean>;

    /**
     * The <i>insertManyIfNotExists</i> method inserts multiple items for the keys do not exist.
     * The method will return a record where the inserted keys will be true and the keys that are already found will be false.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    insertManyIfNotExists(
        settings: InsertManyIfNotExistsSettings<TValue>,
    ): Promise<IterableRecord<StorageKey, boolean>>;

    /**
     * The <i>update</i> method updates a item. If the key is not found an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {KeysNotFoundStorageError}
     */
    update(key: StorageKey, updateValue: AsyncLazyable<TValue>): Promise<void>;

    /**
     * The <i>updateIfExists</i> method updates a item when the <i>key</i> exists.
     * The method returns true when item is updated.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    updateIfExists(
        key: StorageKey,
        updateValue: AsyncLazyable<TValue>,
    ): Promise<boolean>;

    /**
     * The <i>updateManyIfExists</i> method update multiple items for the keys that exist.
     * The method will return a record where the updated keys will be true and the keys that are not found will be false.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    updateManyIfExists(
        settings: UpdateManyIfNotExistsSettings<TValue>,
    ): Promise<IterableRecord<StorageKey, boolean>>;

    /**
     * The <i>increment</i> method increments a item. If the key is not found or when the item type is not a number an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {KeysNotFoundStorageError}
     * @throws {TypeStorageError}
     */
    increment(
        key: StorageKey,
        updateValue: AsyncLazyable<number>,
        settings?: ClampSettings,
    ): Promise<void>;

    /**
     * The <i>incrementIfExists</i> method increments a item when the <i>key</i> exists. If the item type is not a number an error will be thrown.
     * The method returns true when item is updated.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    incrementIfExists(
        key: StorageKey,
        updateValue: AsyncLazyable<number>,
        settings?: ClampSettings,
    ): Promise<boolean>;

    /**
     * The <i>incrementManyIfExists</i> method increments multiple items for the keys that exist. If the item type is not a number an error will be thrown.
     * The method will return a record where the updated keys will be true and the keys that are not found will be false.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    incrementManyIfExists(
        settings: IncrementManyIfNotExistsSettings,
    ): Promise<boolean>;

    /**
     * The <i>decrement</i> method decrements a item. If the key is not found or when the item type is not a number an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {KeysNotFoundStorageError}
     * @throws {TypeStorageError}
     */
    decrement(
        key: StorageKey,
        updateValue: AsyncLazyable<number>,
        settings?: ClampSettings,
    ): Promise<void>;

    /**
     * The <i>decrementIfExists</i> method decrements a item when the <i>key</i> exists. If the item type is not a number an error will be thrown.
     * The method returns true when item is updated.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    decrementIfExists(
        key: StorageKey,
        updateValue: AsyncLazyable<number>,
        settings?: ClampSettings,
    ): Promise<boolean>;

    /**
     * The <i>decrementManyIfExists</i> method decrements multiple items for the keys that exist. If the item type is not a number an error will be thrown.
     * The method will return a record where the updated keys will be true and the keys that are not found will be false.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    decrementManyIfExists(
        settings: DecrementManyIfNotExistsSettings,
    ): Promise<boolean>;

    /**
     * The <i>insertOrUpdate</i> method updates a item when the <i>key</i> exists otherwise the item will be inserted.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    insertOrUpdate(
        key: StorageKey,
        insertValue: AsyncLazyable<TValue>,
        updateValue: AsyncLazyable<TValue>,
    ): Promise<void>;

    /**
     * The <i>insertOrUpdateMany</i> method updates multiple items for the <i>keys</i> that exists and rest of the items that dont exist will be inserted.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    insertOrUpdateMany(
        settings: InsertOrUpdateManySettings<TValue>,
    ): Promise<void>;

    /**
     * The <i>insertOrIncrement</i> method increments a item when the <i>key</i> exists otherwise the item will be inserted. If the item type is not a number an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    insertOrIncrement(
        key: StorageKey,
        insertValue: AsyncLazyable<number>,
        updateValue: AsyncLazyable<number>,
        settings?: ClampSettings,
    ): Promise<void>;

    /**
     * The <i>insertOrIncrementMany</i> method increments multiple items for the <i>keys</i> that exists and rest of the items that dont exist will be inserted.
     * If one of the items type are not a number an error will be thrown
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    insertOrIncrementMany(
        settings: InsertOrIncrementManySettings,
    ): Promise<void>;

    /**
     * The <i>insertOrDecrement</i> method decrements a item when the <i>key</i> exists otherwise the item will be inserted. If the item type is not a number an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    insertOrDecrement(
        key: StorageKey,
        insertValue: AsyncLazyable<number>,
        updateValue: AsyncLazyable<number>,
        settings?: ClampSettings,
    ): Promise<void>;

    /**
     * The <i>insertOrDecrementMany</i> method decrements multiple items for the <i>keys</i> that exists and rest of the items that dont exist will be inserted.
     * If one of the items type are not a number an error will be thrown
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {TypeStorageError}
     */
    insertOrDecrementMany(
        settings: InsertOrDecrementManySettings,
    ): Promise<void>;

    /**
     * The <i>remove</i> method removes a item. If the key is not found an error will be thrown.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     * @throws {KeysNotFoundStorageError}
     */
    remove(key: StorageKey): Promise<void>;

    /**
     * The <i>removeIfExists</i> method removes a item when the <i>key</i> exists.
     * The method returns true when item is removed.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    removeIfExists(key: StorageKey): Promise<boolean>;

    /**
     * The <i>removeManyIfExists</i> method removes multiple items for the keys that exist.
     * The method will return record where the removed keys will be true and the keys that are not found will be false.
     * @throws {StorageError}
     * @throws {UnexpectedStorageError}
     */
    removeManyIfExists(
        settings: InsertManyIfNotExistsSettings<TValue>,
    ): Promise<IterableRecord<StorageKey, boolean>>;
};

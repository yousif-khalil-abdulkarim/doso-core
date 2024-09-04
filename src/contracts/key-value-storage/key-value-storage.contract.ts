import { type RecordItem } from "@/_shared/types";
import { type ClampSettings } from "@/contracts/key-value-storage/_shared";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type KeyValueStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeKeyValueStorageError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedKeyValueStorageError,
} from "@/contracts/key-value-storage/_shared";

export type InsertOrUpdateItem<TKey extends string, TValue> = RecordItem<
    TKey,
    {
        insertValue: TValue;
        updateValue: TValue;
    }
>;

/**
 * <i>IKeyValueStorage</i> is Key Value storage adapter.
 * @throws {KeyValueStorageError}
 * @throws {TypeKeyValueStorageError}
 * @throws {UnexpectedKeyValueStorageError}
 * @group Contracts
 */
export type IKeyValueStorage<TValue = unknown> = AsyncIterable<
    RecordItem<string, TValue>
> & {
    /**
     * The <i>clear</i> method removes all items.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    clear(): Promise<void>;

    /**
     * The <i>size</i> method returns the total number of items.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    size(): Promise<number>;

    /**
     * The <i>hasMany</i> method returns a record of booleans. Each boolean represents existing (<i>true</i>) or missing (<i>false</i>) item.
     * This method is optional to implement because it can be derived from <i>getMany</i>.
     * The method should be implemented, if it's possible to verify the existence of the item without fetching its entire value.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    hasMany?<TKey extends string>(keys: TKey[]): Promise<Record<TKey, boolean>>;

    /**
     * The <i>getMany</i> method return a record of values. Each value is <i>TValue</i> or <i>null</i> when missing.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    getMany<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, TValue | null>>;

    /**
     * The <i>getAndRemoveMany</i> method return a record of values. Each value is <i>TValue</i> or <i>null</i> when missing.
     * All retrived values (<i>TValue</i>) are removed.
     * This method is optional to implement because it can be derived from <i>getMany</i> and <i>removeMany</i>.
     * The method should be implemented if it's possible to retrieve and remove in a single database call.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    getAndRemoveMany?<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, TValue | null>>;

    /**
     * The <i>getOrInsertMany</i> method return a record of values.
     * All existing items will be retrieved, and any non existent items will be inserted with the provided values and returned.
     * This method is optional to implement because it can be derived from <i>getMany</i> and <i>insertMany</i>.
     * The method should be implemented if it's possible to retrieve or insert in a single database call.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    getOrInsertMany?<TKey extends string>(
        items: RecordItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, TValue>>;

    /**
     * The <i>getStartsWithMany</i> method returns all items (as <i>{@link AsyncIterable}</i>) where the key starts with <i>keyPrefix</i>.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    getStartsWithMany(
        keyPrefix: string,
    ): AsyncIterable<RecordItem<string, TValue>>;

    /**
     * The <i>getEndsWithMany</i> method returns all items (as <i>{@link AsyncIterable}</i>) where the key ends with <i>keySuffix</i>.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    getEndsWithMany(
        keySuffix: string,
    ): AsyncIterable<RecordItem<string, TValue>>;

    /**
     * The <i>getIncludesMany</i> method returns all items (as <i>{@link AsyncIterable}</i>) where the key includes <i>includeKey</i>.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    getIncludesMany(
        includeKey: string,
    ): AsyncIterable<RecordItem<string, TValue>>;

    /**
     * The <i>insertIfNotExistsMany</i> method inserts <i>items</i> and returns record of booleans.
     * Each boolean represents inserted item (<i>true</i>) or not inserted item (<i>false</i>).
     * A <i>{@link ClampSettings}<i> setting can be provided to clamp number values. It will not have effect on non number values.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    insertIfNotExistsMany<TKey extends string>(
        items: RecordItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, boolean>>;

    /**
     * The <i>updateIfExistsMany</i> method updates <i>items</i> and returns record of booleans.
     * Each boolean represents updated item (<i>true</i>) or not found item (<i>false</i>).
     * A <i>{@link ClampSettings}<i> setting can be provided to clamp number values. It will not have effect on non number values.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    updateIfExistsMany<TKey extends string>(
        updateValues: RecordItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, boolean>>;

    /**
     * The <i>incrementIfExistsMany</i> method increments <i>items</i> and returns record of booleans.
     * A <i>{@link ClampSettings}<i> setting can be provided to clamp number values. It will not have effect on non number values.
     * An error will be throwen if at least one of the items are non numbers.
     * This method is optional to implement because it can be derived from <i>getMany</i> and <i>updateMany</i>.
     * The method should be implemented if it's possible to increment in a single database call.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     * @throws {TypeKeyValueStorageError}
     */
    incrementIfExistsMany?<TKey extends string>(
        updateValues: RecordItem<TKey, number>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, boolean>>;

    /**
     * The <i>insertOrUpdateMany</i> method inserts the items that don't exist with given values or updates the exisitng items with given values.
     * A <i>{@link ClampSettings}<i> setting can be provided to clamp number values. It will not have effect on non number values.
     * This method is optional to implement because it can be derived from <i>insertMany</i> and <i>updateMany</i>.
     * The method should be implemented if it's possible to insert or update in a single database call.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    insertOrUpdateMany?<TKey extends string>(
        items: InsertOrUpdateItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<void>;

    /**
     * The <i>insertOrIncrementMany</i> method inserts the items that don't exist with given values or increments the exisitng items with given values.
     * A <i>{@link ClampSettings}<i> setting can be provided to clamp number values. It will not have effect on non number values.
     * An error will be throwen if at least one of the items are non numbers.
     * This method is optional to implement because it can be derived from <i>insertMany</i>, <i>getMany</i> and <i>updateMany</i>.
     * The method should be implemented if it's possible to insert or increment in a single database call.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     * @throws {TypeKeyValueStorageError}
     */
    insertOrIncrementMany?<TKey extends string>(
        items: InsertOrUpdateItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<void>;

    /**
     * The <i>removeIfExistsMany</i> method removes <i>keys</i> and returns record of booleans.
     * Each boolean represents removed item (<i>true</i>) or not found item (<i>false</i>).
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     */
    removeIfExistsMany<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, boolean>>;

    /**
     * The <i>transaction</i> method removes existing items.
     * This method is optional to implement because not all drivers support transactions.
     * The default implementations will call <i>transactionFn<\i> without performing a transaction.
     * @throws {KeyValueStorageError}
     * @throws {UnexpectedKeyValueStorageError}
     * @throws {TypeKeyValueStorageError}
     */
    transaction?<TReturn>(
        transactionFn: (storage: IKeyValueStorage<TValue>) => Promise<TReturn>,
    ): Promise<TReturn>;
};

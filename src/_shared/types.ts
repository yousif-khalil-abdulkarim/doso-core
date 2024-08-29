export type EnsureType<TValue, TType> =
    Exclude<TValue, TType> extends never ? TValue : never;

export type RecordItem<TKey, TValue> = [key: TKey, value: TValue];

export type Lazyable<TValue> = TValue | (() => TValue);
/**
 * @internal
 */
export type AsyncLazyable_<TValue> = TValue | (() => Promise<TValue>);
export type AsyncLazyable<TValue> = AsyncLazyable_<TValue> | Lazyable<TValue>;

/**
 * @internal
 */
export const TAG_SYMBOL = Symbol("TAG_SYMBOL");
/**
 * @internal
 */
export type ITaggable = {
    [TAG_SYMBOL]: symbol;
};

export type AsyncIterableValue<TInput> =
    | Iterable<TInput>
    | AsyncIterable<TInput>;

/**
 * @internal
 */
export const ITERABLE_RECORD_SYMBOL = Symbol("ITERABLE_RECORD_SYMBOL");

/**
 * @internal
 */
export type IterableRecord<TKey extends string | number, TValue> = ITaggable &
    Record<string, TValue> &
    Iterable<RecordItem<TKey, TValue>>;

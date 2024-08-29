import {
    type IterableRecord,
    TAG_SYMBOL,
    ITERABLE_RECORD_SYMBOL,
} from "@/_shared/types";

/**
 * The <i>isIterable</i> returns true if the value is <i>{@link Iterable}</i>.
 * @group Utilities
 */
export function isIterable<TItem>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
): value is Iterable<TItem> {
    return (
        typeof value === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value[Symbol.iterator] === "function"
    );
}

/**
 * The <i>isAsyncIterable</i> returns true if the value is <i>{@link AsyncIterable}</i>.
 * @group Utilities
 */
export function isAsyncIterable<TItem>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
): value is AsyncIterable<TItem> {
    return (
        typeof value === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value[Symbol.asyncIterator] === "function"
    );
}

/**
 * The <i>isIterableRecord</i> returns true if the value is <i>{@link IterableRecord}</i>.
 * @group Utilities
 */
export function isIterableRecord<TKey extends string | number, TValue>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
): value is IterableRecord<TKey, TValue> {
    return (
        typeof value === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        value[TAG_SYMBOL] === ITERABLE_RECORD_SYMBOL
    );
}

/**
 * The <i>makeIterableRecord</i> function makes brand new <i>{@link IterableRecord}</i>
 */
export function makeIterableRecord<TKey extends string | number, TValue>(
    record: Record<TKey, TValue>,
): IterableRecord<TKey, TValue> {
    return {
        ...record,
        [TAG_SYMBOL]: ITERABLE_RECORD_SYMBOL,
    } as IterableRecord<TKey, TValue>;
}

import {
    type IterableRecord,
    TAG_SYMBOL,
    ITERABLE_RECORD_SYMBOL,
    type Lazyable,
    type AsyncLazyable,
    type AsyncIterableValue,
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
 * @internal
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
        *[Symbol.iterator]() {
            for (const item in record) {
                yield item;
            }
        },
        [TAG_SYMBOL]: ITERABLE_RECORD_SYMBOL,
    } as IterableRecord<TKey, TValue>;
}

/**
 * @internal
 */
export async function simplifyAsyncLazyable<TValue>(
    lazyable: AsyncLazyable<TValue>,
): Promise<TValue> {
    if (typeof lazyable === "function") {
        const function_ = lazyable as () => Promise<TValue>;
        return function_();
    }
    return lazyable;
}

/**
 * @internal
 */
export function simplifyLazyable<TValue>(lazyable: Lazyable<TValue>): TValue {
    if (typeof lazyable === "function") {
        const function_ = lazyable as () => TValue;
        return function_();
    }
    return lazyable;
}

/**
 * @internal
 */
export async function simplifyAsyncIterableValue<TValue>(
    iterable: AsyncIterableValue<TValue>,
): Promise<TValue[]> {
    if (isIterable<TValue>(iterable)) {
        return [...iterable];
    }
    if (isAsyncIterable<TValue>(iterable)) {
        const items: TValue[] = [];
        for await (const item of iterable) {
            items.push(item);
        }
        return items;
    }
    throw new Error(
        "The function is in invalid state. This error shouldnt occur, properly caused by a bug!",
    );
}

export type Range = {
    min?: number;
    max?: number;
};
/**
 * @internal
 */
export function clamp(value: number, { max, min }: Range): number {
    if (max && value > max) {
        return max;
    }
    if (min && value < min) {
        return min;
    }
    return value;
}

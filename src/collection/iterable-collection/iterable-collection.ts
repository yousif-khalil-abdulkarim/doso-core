import {
    type Collapse,
    CollectionError,
    type Comparator,
    type Filter,
    type FindOrSettings,
    type FindSettings,
    type ForEach,
    type GroupBySettings,
    type ICollection,
    ItemNotFoundError,
    type JoinSettings,
    type Lazyable,
    type Map,
    type Modifier,
    MultipleItemsFoundError,
    IndexOverflowError,
    type PageSettings,
    type RecordItem,
    type ReduceSettings,
    type ReverseSettings,
    type SliceSettings,
    type SlidingSettings,
    type Tap,
    type Transform,
    UnexpectedCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_module";
import {
    CrossJoinIterable,
    SlidingIteralbe,
    ShuffleIterable,
    EntriesIterable,
    FilterIterable,
    ChunkIterable,
    ChunkWhileIterable,
    CollapseIterable,
    CountByIterable,
    FlatMapIterable,
    GroupByIterable,
    InsertAfterIterable,
    InsertBeforeIterable,
    MapIterable,
    MergeIterable,
    PadEndIterable,
    PadStartIterable,
    PartionIterable,
    SkipIterable,
    SkipUntilIterable,
    SortIterable,
    SplitIterable,
    TakeIterable,
    TakeUntilIterable,
    TapIterable,
    UniqueIterable,
    UpdateIterable,
    WhenIterable,
    ZipIterable,
    ReverseIterable,
    SliceIterable,
    RepeatIterable,
} from "@/collection/iterable-collection/iterable-helpers/_module";
import { type EnsureType } from "@/types";

/**
 * Most methods in IterableCollection are lazy and will only execute when calling methods return values or iterating through an IterableCollection by using for of loop.
 * @group Collections
 */
export class IterableCollection<TInput> implements ICollection<TInput> {
    private static THROW_ON_NUMBER_LIMIT = false;

    private static DEFAULT_CHUNK_SIZE = 1024;

    private static makeCollection = <TInput>(
        iterable: Iterable<TInput> = [],
    ): ICollection<TInput> => {
        return new IterableCollection<TInput>(iterable);
    };

    constructor(private iterable: Iterable<TInput>) {}

    *[Symbol.iterator](): Iterator<TInput> {
        try {
            yield* this.iterable;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    iterator(): Iterator<TInput, void> {
        return this[Symbol.iterator]() as Iterator<TInput, void>;
    }

    entries(
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<RecordItem<number, TInput>> {
        return new IterableCollection(
            new EntriesIterable(this, throwOnNumberLimit),
        );
    }

    keys(
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<number> {
        return this.entries(throwOnNumberLimit).map(([key]) => key);
    }

    values(): ICollection<TInput> {
        return this.entries().map(([_key, value]) => value);
    }

    filter<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TOutput> {
        return new IterableCollection<TOutput>(
            new FilterIterable(this, filter, throwOnNumberLimit),
        );
    }

    map<TOutput>(
        map: Map<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TOutput> {
        return new IterableCollection(
            new MapIterable(this, map, throwOnNumberLimit),
        );
    }

    reduce<TOutput = TInput>(
        settings: ReduceSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            const {
                reduceFn: reduce,
                initialValue,
                throwOnNumberLimit,
            } = settings;
            if (initialValue === undefined && this.empty()) {
                throw new TypeError(
                    "Reduce of empty array must be inputed a initial value",
                );
            }
            if (initialValue !== undefined) {
                let output = initialValue as TOutput,
                    index = 0;
                for (const item of this) {
                    if (
                        throwOnNumberLimit &&
                        index === Number.MAX_SAFE_INTEGER
                    ) {
                        throw new IndexOverflowError("Index has overflowed");
                    }
                    output = reduce(output, item, index, this);
                    index++;
                }
                return output;
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
            let output: TOutput = this.firstOrFail() as any,
                index = 0,
                isFirstIteration = true;
            for (const item of this) {
                if (!isFirstIteration) {
                    if (
                        throwOnNumberLimit &&
                        index === Number.MAX_SAFE_INTEGER
                    ) {
                        throw new IndexOverflowError("Index has overflowed");
                    }
                    output = reduce(output, item, index, this);
                }
                isFirstIteration = false;
                index++;
            }
            return output;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    join(settings?: JoinSettings): string {
        try {
            return this.reduce({
                reduceFn(str, item) {
                    if (typeof item !== "string") {
                        throw new TypeError(
                            "Item type is invalid must be string",
                        );
                    }
                    const separator = settings?.seperator ?? ",";
                    return str + separator + item;
                },
                throwOnNumberLimit:
                    settings?.throwOnNumberLimit ??
                    IterableCollection.THROW_ON_NUMBER_LIMIT,
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    collapse(): ICollection<Collapse<TInput>> {
        return new IterableCollection(new CollapseIterable(this));
    }

    flatMap<TOutput>(
        map: Map<TInput, ICollection<TInput>, Iterable<TOutput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TOutput> {
        return new IterableCollection(
            new FlatMapIterable(this, map, throwOnNumberLimit),
        );
    }

    update<TFilterOutput extends TInput, TMapOutput>(
        filter: Filter<TInput, ICollection<TInput>, TFilterOutput>,
        map: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<UpdatedItem<TInput, TFilterOutput, TMapOutput>> {
        return new IterableCollection(
            new UpdateIterable(this, filter, map, throwOnNumberLimit),
        );
    }

    page(settings: PageSettings): ICollection<TInput> {
        const { page, pageSize, throwOnNumberLimit } = settings;
        if (page < 0) {
            return this.skip(page * pageSize, throwOnNumberLimit).take(
                pageSize,
                throwOnNumberLimit,
            );
        }
        return this.skip((page - 1) * pageSize, throwOnNumberLimit).take(
            page * pageSize,
            throwOnNumberLimit,
        );
    }

    sum(): EnsureType<TInput, number> {
        try {
            let sum = 0;
            for (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                sum += item;
            }
            return sum as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    average(): EnsureType<TInput, number> {
        try {
            let size = 0,
                sum = 0;
            for (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                size++;
                sum += item;
            }
            return (sum / size) as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    median(
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): EnsureType<TInput, number> {
        if (this.empty()) {
            return 0 as EnsureType<TInput, number>;
        }
        const size = this.size(throwOnNumberLimit);
        if (size === 0) {
            return 0 as EnsureType<TInput, number>;
        }
        const isEven = size % 2 === 0,
            items = this.map((item) => {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                return item;
            }, throwOnNumberLimit)
                .filter((_item, index) => {
                    if (isEven) {
                        return index === size / 2 || index === size / 2 - 1;
                    }
                    return index === Math.floor(size / 2);
                }, throwOnNumberLimit)

                .toArray();
        if (isEven) {
            const [a, b] = items;
            if (a === undefined) {
                throw new UnexpectedCollectionError("Is in invalid state");
            }
            if (b === undefined) {
                throw new UnexpectedCollectionError("Is in invalid state");
            }
            return ((a + b) / 2) as EnsureType<TInput, number>;
        }
        const [median] = items;
        if (median === undefined) {
            throw new UnexpectedCollectionError("Is in invalid state");
        }
        return median as EnsureType<TInput, number>;
    }

    min(): EnsureType<TInput, number> {
        try {
            let min = 0;
            for (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                if (min === 0) {
                    min = item;
                } else if (min > item) {
                    min = item;
                }
            }
            return min as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    max(): EnsureType<TInput, number> {
        try {
            let max = 0;
            for (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                if (max === 0) {
                    max = item;
                } else if (max < item) {
                    max = item;
                }
            }
            return max as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    percentage(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): number {
        try {
            if (this.empty()) {
                return 0;
            }
            let part = 0,
                total = 0;
            for (const item of this) {
                if (throwOnNumberLimit && total === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError(
                        "The total amount has overflowed",
                    );
                }
                if (filter(item, total, this)) {
                    part++;
                }
                total++;
            }
            return (part / total) * 100;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    some<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): boolean {
        try {
            let index = 0;
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (filter(item, index, this)) {
                    return true;
                }
                index++;
            }
            return false;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    every<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): boolean {
        try {
            let index = 0,
                isTrue = true;
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                isTrue &&= filter(item, index, this);
                if (!isTrue) {
                    break;
                }
                index++;
            }
            return isTrue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    take(
        limit: number,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput> {
        return new IterableCollection(
            new TakeIterable(this, limit, throwOnNumberLimit),
        );
    }

    takeUntil(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput> {
        return new IterableCollection(
            new TakeUntilIterable(this, filter, throwOnNumberLimit),
        );
    }

    takeWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput> {
        return this.takeUntil(
            (...arguments_) => !filter(...arguments_),
            throwOnNumberLimit,
        );
    }

    skip(
        offset: number,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput> {
        return new IterableCollection(
            new SkipIterable(this, offset, throwOnNumberLimit),
        );
    }

    skipUntil(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput> {
        return new IterableCollection(
            new SkipUntilIterable(this, filter, throwOnNumberLimit),
        );
    }

    skipWhile<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput> {
        return this.skipUntil(
            (...arguments_) => !filter(...arguments_),
            throwOnNumberLimit,
        );
    }

    when<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new WhenIterable(this, () => condition, callback),
        );
    }

    whenEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new WhenIterable(this, () => this.empty(), callback),
        );
    }

    whenNot<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return this.when(!condition, callback);
    }

    whenNotEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new WhenIterable(this, () => this.notEmpty(), callback),
        );
    }

    pipe<TOutput = TInput>(
        callback: Transform<ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            return callback(this);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    tap(callback: Tap<ICollection<TInput>>): ICollection<TInput> {
        return new IterableCollection(new TapIterable(this, callback));
    }

    chunk(chunkSize: number): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new ChunkIterable(
                this,
                chunkSize,
                IterableCollection.makeCollection,
            ),
        );
    }

    chunkWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new ChunkWhileIterable(
                this,
                filter,
                throwOnNumberLimit,
                (iterable) => new IterableCollection(iterable),
            ),
        );
    }

    split(
        chunkAmount: number,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new SplitIterable(
                this,
                chunkAmount,
                throwOnNumberLimit,
                IterableCollection.makeCollection,
            ),
        );
    }

    partition(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new PartionIterable(
                this,
                filter,
                throwOnNumberLimit,
                IterableCollection.makeCollection,
            ),
        );
    }

    sliding(settings: SlidingSettings): ICollection<ICollection<TInput>> {
        const {
            chunkSize,
            step = chunkSize - 1,
            throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
        } = settings;
        return new IterableCollection(
            new SlidingIteralbe(this, chunkSize, step, throwOnNumberLimit),
        );
    }

    groupBy<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<RecordItem<TOutput, ICollection<TInput>>> {
        return new IterableCollection(
            new GroupByIterable(
                this,
                settings?.mapFn,
                settings?.throwOnNumberLimit ??
                    IterableCollection.THROW_ON_NUMBER_LIMIT,
                (iterable) => new IterableCollection(iterable),
            ),
        );
    }

    countBy<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<RecordItem<TOutput, number>> {
        return new IterableCollection(
            new CountByIterable(
                this,
                settings?.mapFn,
                settings?.throwOnNumberLimit ??
                    IterableCollection.THROW_ON_NUMBER_LIMIT,
            ),
        );
    }

    unique<TOutput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TInput> {
        return new IterableCollection(
            new UniqueIterable(
                this,
                settings?.mapFn,
                settings?.throwOnNumberLimit ??
                    IterableCollection.THROW_ON_NUMBER_LIMIT,
            ),
        );
    }

    difference<TOutput = TInput>(
        iterable: Iterable<TInput>,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        map: Map<TInput, ICollection<TInput>, TOutput> = (item) => item as any,
    ): ICollection<TInput> {
        const differenceCollection = new IterableCollection(iterable);
        return this.filter((item, index, collection) => {
            return !differenceCollection.some(
                (matchItem, matchIndex, matchCollection) => {
                    return (
                        map(item, index, collection) ===
                        map(matchItem, matchIndex, matchCollection)
                    );
                },
            );
        });
    }

    repeat(amount: number): ICollection<TInput> {
        return new IterableCollection(
            new RepeatIterable(this, amount, IterableCollection.makeCollection),
        );
    }

    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new PadStartIterable(
                this,
                maxLength,
                fillItems,
                IterableCollection.makeCollection,
            ),
        );
    }

    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new PadEndIterable(
                this,
                maxLength,
                fillItems,
                IterableCollection.makeCollection,
            ),
        );
    }

    slice(settings?: SliceSettings): ICollection<TInput> {
        return new IterableCollection(
            new SliceIterable(
                this,
                settings?.start,
                settings?.end,
                settings?.throwOnNumberLimit ??
                    IterableCollection.THROW_ON_NUMBER_LIMIT,
            ),
        );
    }

    prepend<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(new MergeIterable(iterable, this));
    }

    append<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(new MergeIterable(this, iterable));
    }

    insertBefore<TExtended = TInput>(
        filter: Filter<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new InsertBeforeIterable(
                this,
                filter,
                iterable,
                throwOnNumberLimit,
            ),
        );
    }

    insertAfter<TExtended = TInput>(
        filter: Filter<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new InsertAfterIterable(this, filter, iterable, throwOnNumberLimit),
        );
    }

    crossJoin<TExtended = TInput>(
        ...iterables: Array<Iterable<TExtended>>
    ): ICollection<ICollection<TInput | TExtended>> {
        return new IterableCollection(
            new CrossJoinIterable(
                this as ICollection<TInput>,
                iterables,
                IterableCollection.makeCollection,
            ),
        );
    }

    zip<TExtended>(
        iterable: Iterable<TExtended>,
    ): ICollection<RecordItem<TInput, TExtended>> {
        return new IterableCollection(new ZipIterable(this, iterable));
    }

    sort(compare?: Comparator<TInput>): ICollection<TInput> {
        return new IterableCollection(new SortIterable(this, compare));
    }

    reverse(settings?: ReverseSettings): ICollection<TInput> {
        return new IterableCollection(
            new ReverseIterable(
                this,
                settings?.chunkSize ?? IterableCollection.DEFAULT_CHUNK_SIZE,
                settings?.throwOnNumberLimit ??
                    IterableCollection.THROW_ON_NUMBER_LIMIT,
                (iterable) => new IterableCollection(iterable),
            ),
        );
    }

    shuffle(): ICollection<TInput> {
        return new IterableCollection(new ShuffleIterable(this));
    }

    first<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        try {
            return this.firstOr({
                ...settings,
                defaultValue: null,
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    firstOr<TOutput extends TInput, TExtended = TInput>(
        settings: FindOrSettings<
            TInput,
            ICollection<TInput>,
            TOutput,
            TExtended
        >,
    ): TOutput | TExtended {
        try {
            const throwOnNumberLimit =
                settings.throwOnNumberLimit ??
                IterableCollection.THROW_ON_NUMBER_LIMIT;
            let index = 0;
            const filter = settings.filterFn ?? (() => true);
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (filter(item, index, this)) {
                    return item as TOutput;
                }
                index++;
            }
            if (typeof settings.defaultValue === "function") {
                const defaultFn = settings.defaultValue as () => TOutput;
                return defaultFn();
            }
            return settings.defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    firstOrFail<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        const item = this.first(settings);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    last<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        try {
            return this.lastOr({
                ...settings,
                defaultValue: null,
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    lastOr<TOutput extends TInput, TExtended = TInput>(
        settings: FindOrSettings<
            TInput,
            ICollection<TInput>,
            TOutput,
            TExtended
        >,
    ): TOutput | TExtended {
        try {
            const throwOnNumberLimit =
                settings.throwOnNumberLimit ??
                IterableCollection.THROW_ON_NUMBER_LIMIT;
            let index = 0;
            const filter = settings.filterFn ?? (() => true);
            let matchedItem: TOutput | null = null;
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (filter(item, index, this)) {
                    matchedItem = item as TOutput;
                }
                index++;
            }
            if (matchedItem) {
                return matchedItem;
            }
            if (typeof settings.defaultValue === "function") {
                const defaultFn = settings.defaultValue as () => TOutput;
                return defaultFn();
            }
            return settings.defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    lastOrFail<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        const item = this.last(settings);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    before(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): TInput | null {
        return this.beforeOr(null, filter, throwOnNumberLimit);
    }

    beforeOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): TInput | TExtended {
        try {
            let beforeItem: TInput | null = null,
                index = 0;
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (filter(item, index, this) && beforeItem) {
                    return beforeItem;
                }
                index++;
                beforeItem = item;
            }
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TExtended;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    beforeOrFail(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): TInput {
        const item = this.before(filter, throwOnNumberLimit);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    after(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): TInput | null {
        return this.afterOr(null, filter, throwOnNumberLimit);
    }

    afterOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): TInput | TExtended {
        try {
            let hasMatched = false,
                index = 0;
            for (const item of this) {
                if (hasMatched) {
                    return item;
                }
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                hasMatched = filter(item, index, this);
                index++;
            }
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TExtended;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    afterOrFail(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): TInput {
        const item = this.after(filter, throwOnNumberLimit);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    sole<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): TOutput {
        try {
            let index = 0,
                matchedItem: TOutput | null = null;
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (filter(item, index, this)) {
                    if (matchedItem !== null) {
                        throw new MultipleItemsFoundError(
                            "Multiple items were found",
                        );
                    }
                    matchedItem = item as TOutput;
                }
                index++;
            }
            if (matchedItem === null) {
                throw new ItemNotFoundError("Item was not found");
            }
            return matchedItem;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    nth(step: number): ICollection<TInput> {
        return this.filter((_item, index) => index % step === 0);
    }

    count(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): number {
        try {
            let size = 0;
            for (const item of this) {
                if (throwOnNumberLimit && size === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Size has overflowed");
                }
                if (filter(item, size, this)) {
                    size++;
                }
            }
            return size;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    size(
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): number {
        return this.count(() => true, throwOnNumberLimit);
    }

    empty(): boolean {
        try {
            for (const _ of this) {
                return false;
            }
            return true;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    notEmpty(): boolean {
        return !this.empty();
    }

    search(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): number {
        try {
            let index = 0;
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if (filter(item, index, this)) {
                    return index;
                }
                index++;
            }
            return -1;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    forEach(
        callback: ForEach<TInput, ICollection<TInput>>,
        throwOnNumberLimit = IterableCollection.THROW_ON_NUMBER_LIMIT,
    ): void {
        try {
            let index = 0;
            for (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                callback(item, index, this);
                index++;
            }
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    toArray(): TInput[] {
        try {
            return [...this];
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

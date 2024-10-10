import {
    CollectionError,
    type Predicate,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class PartionIterable<TInput> implements Iterable<ICollection<TInput>> {
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
        try {
            let chunkA: ICollection<TInput> = this.makeCollection<TInput>([]),
                chunkB: ICollection<TInput> = this.makeCollection<TInput>([]);
            for (const [index, item] of this.collection.entries()) {
                if (this.predicateFn(item, index, this.collection)) {
                    chunkA = chunkA.append([item]);
                } else {
                    chunkB = chunkB.append([item]);
                }
            }
            yield chunkA;
            yield chunkB;
        } catch (error: unknown) {
            if (error instanceof CollectionError) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}

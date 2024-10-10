import {
    CollectionError,
    type Predicate,
    type ICollection,
    UnexpectedCollectionError,
} from "@/contracts/collection/_module";

/**
 * @internal
 */
export class ChunkWhileIterable<TInput>
    implements Iterable<ICollection<TInput>>
{
    constructor(
        private collection: ICollection<TInput>,
        private predicateFn: Predicate<TInput, ICollection<TInput>>,

        private makeCollection: <TInput>(
            iterable: Iterable<TInput>,
        ) => ICollection<TInput>,
    ) {}

    *[Symbol.iterator](): Iterator<ICollection<TInput>> {
        try {
            let collection: ICollection<TInput> = this.makeCollection<TInput>(
                [],
            );
            for (const [index, item] of this.collection.entries()) {
                if (index === 0) {
                    collection = collection.append([item]);
                } else if (this.predicateFn(item, index, collection)) {
                    collection = collection.append([item]);
                } else {
                    yield collection;
                    collection = this.makeCollection<TInput>([item]);
                }
            }
            yield collection;
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

/* eslint-disable @typescript-eslint/require-await */

import { type RecordItem } from "@/_shared/types";
import { clamp } from "@/_shared/utilities";
import { type ClampSettings } from "@/contracts/key-value-storage/_shared";
import { type IKeyValueStorage } from "@/contracts/key-value-storage/key-value-storage.contract";

export type MemoryKeyValueStorageSettings = {
    namespace: string;
};

/**
 * @private
 */
type InternalKey = {
    key: string;
    namespace: string;
};
/**
 * @group Adapters
 */
export class MemoryKeyValueStorage<TValue = unknown>
    implements IKeyValueStorage<TValue>
{
    constructor(
        private readonly map: Map<string, string>,
        private readonly namespace: string,
    ) {}

    private serializeInternalKey({ key, namespace }: InternalKey): string {
        return JSON.stringify({
            key,
            namespace,
        });
    }

    private deserializeInternalKey(internalKey: string): InternalKey {
        return JSON.parse(internalKey) as InternalKey;
    }

    private getInternal(key: InternalKey): TValue | null {
        const value = this.map.get(this.serializeInternalKey(key));
        if (value) {
            return JSON.parse(value) as TValue;
        }
        return null;
    }

    private hasInternal(key: InternalKey): boolean {
        return this.map.has(this.serializeInternalKey(key));
    }

    private removeInternal(key: InternalKey): boolean {
        return this.map.delete(this.serializeInternalKey(key));
    }

    private setInternal(key: InternalKey, value: TValue): void {
        this.map.set(this.serializeInternalKey(key), JSON.stringify(value));
    }

    private clearInternal(namespace_: string): void {
        for (const [internalKey] of this.map) {
            const { namespace } = this.deserializeInternalKey(internalKey);
            if (namespace_ === namespace) {
                this.map.delete(internalKey);
            }
        }
    }

    private sizeInternal(namespace_: string): number {
        let size = 0;
        for (const [internalKey] of this.map) {
            const { namespace } = this.deserializeInternalKey(internalKey);
            if (namespace_ === namespace) {
                size++;
            }
        }
        return size;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<RecordItem<string, TValue>> {
        for (const [internalKey, value] of this.map) {
            const { key, namespace } = this.deserializeInternalKey(internalKey);
            if (
                this.namespace === namespace &&
                this.hasInternal({ key, namespace })
            ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                yield [key, JSON.parse(value)];
            }
        }
    }

    async clear(): Promise<void> {
        this.clearInternal(this.namespace);
    }

    async size(): Promise<number> {
        return this.sizeInternal(this.namespace);
    }

    async getMany<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, TValue | null>> {
        const record: Record<string, TValue | null> = {};
        for (const key of keys) {
            const value = this.getInternal({ key, namespace: this.namespace });
            record[key] = value;
        }
        return record;
    }

    private static AsyncFilterIterable = class<TValue>
        implements AsyncIterable<RecordItem<string, TValue>>
    {
        constructor(
            private iterable: AsyncIterable<RecordItem<string, TValue>>,
            private predicateFn: (value: RecordItem<string, TValue>) => boolean,
        ) {}

        async *[Symbol.asyncIterator](): AsyncIterator<
            RecordItem<string, TValue>
        > {
            for await (const item of this.iterable) {
                if (!this.predicateFn(item)) {
                    continue;
                }
                yield item;
            }
        }
    };

    getStartsWithMany(
        keyPrefix: string,
    ): AsyncIterable<RecordItem<string, TValue>> {
        return new MemoryKeyValueStorage.AsyncFilterIterable(this, ([key]) => {
            return key.startsWith(keyPrefix);
        });
    }

    getEndsWithMany(
        keySuffix: string,
    ): AsyncIterable<RecordItem<string, TValue>> {
        return new MemoryKeyValueStorage.AsyncFilterIterable(this, ([key]) =>
            key.endsWith(keySuffix),
        );
    }

    getIncludesMany(key: string): AsyncIterable<RecordItem<string, TValue>> {
        return new MemoryKeyValueStorage.AsyncFilterIterable(this, ([key_]) =>
            key_.includes(key),
        );
    }

    async insertIfNotExistsMany<TKey extends string>(
        items: RecordItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, boolean>> {
        const record: Record<string, boolean> = {};
        // eslint-disable-next-line prefer-const
        for (let [key, value] of items) {
            const hasNotKey = !this.hasInternal({
                key,
                namespace: this.namespace,
            });
            record[key] = hasNotKey;
            if (hasNotKey) {
                if (settings && typeof value === "number") {
                    value = clamp(value, settings) as TValue;
                }
                this.setInternal(
                    {
                        key,
                        namespace: this.namespace,
                    },
                    value,
                );
            }
        }
        return record;
    }

    async updateIfExistsMany<TKey extends string>(
        items: RecordItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, boolean>> {
        const record = {} as Record<TKey, boolean>;
        // eslint-disable-next-line prefer-const
        for (let [key, value] of items) {
            const hasKey = this.hasInternal({
                key,
                namespace: this.namespace,
            });
            record[key] = hasKey;
            if (hasKey) {
                if (settings && typeof value === "number") {
                    value = clamp(value, settings) as TValue;
                }
                this.setInternal(
                    {
                        key,
                        namespace: this.namespace,
                    },
                    value,
                );
            }
        }
        return record;
    }

    async removeIfExistsMany<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, boolean>> {
        const record = {} as Record<TKey, boolean>;
        for (const key of keys) {
            const hasKey = this.removeInternal({
                key,
                namespace: this.namespace,
            });
            record[key] = hasKey;
        }
        return record;
    }
}

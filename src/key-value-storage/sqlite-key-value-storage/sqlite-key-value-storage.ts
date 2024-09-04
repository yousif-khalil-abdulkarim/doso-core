import {
    InsertOrUpdateItem,
    KeyValueStorageError,
    UnexpectedKeyValueStorageError,
    type ClampSettings,
    type IKeyValueStorage,
} from "@/contracts/key-value-storage/_module";
import { type RecordItem } from "@/_shared/types";
import { type RawBuilder, sql, type Kysely } from "kysely";
import {
    SQL_KV_STORAGE_TABLE_NAME,
    type SqlKeyValueStorageTables,
} from "@/key-value-storage/_shared";

/**
 * @group Adapters
 */
export class SqliteKeyValueStorage<TValue = unknown>
    implements IKeyValueStorage<TValue>
{
    static async init(db: Kysely<SqlKeyValueStorageTables>): Promise<void> {
        await db.schema
            .createTable(SQL_KV_STORAGE_TABLE_NAME)
            .ifNotExists()
            .addColumn("namespace", "text", (column) => column.notNull())
            .addColumn("key", "text", (column) => column.notNull())
            .addColumn("value", "text", (column) => column.notNull())
            .addPrimaryKeyConstraint("primary_key", ["key", "namespace"])
            .execute();
    }

    constructor(
        private readonly db: Kysely<SqlKeyValueStorageTables>,
        private readonly namespace: string,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<RecordItem<string, TValue>> {
        try {
            const stream = this.db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "value"])
                .where("namespace", "=", this.namespace)
                .stream();
            for await (const { key, value } of stream) {
                yield [key, JSON.parse(value)];
            }
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async clear(): Promise<void> {
        try {
            await this.db
                .deleteFrom(SQL_KV_STORAGE_TABLE_NAME)
                .where("namespace", "=", this.namespace)
                .execute();
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async size(): Promise<number> {
        try {
            const result = await this.db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select((eb) => eb.fn.count<number>("namespace").as("size"))
                .where("namespace", "=", this.namespace)
                .executeTakeFirst();
            return result?.size ?? 0;
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async hasMany<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, boolean>> {
        try {
            if (keys.length === 0) {
                return {} as Record<TKey, boolean>;
            }
            const result = await this.db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select("key")
                .where("namespace", "=", this.namespace)
                .execute();
            return Object.fromEntries([
                ...keys.map<RecordItem<string, boolean>>((key) => [key, false]),
                ...result.map<RecordItem<string, boolean>>(({ key }) => [
                    key,
                    true,
                ]),
            ]) as Record<TKey, boolean>;
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async getMany<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, TValue | null>> {
        try {
            if (keys.length === 0) {
                return {} as Record<TKey, TValue | null>;
            }
            const result = await this.db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "value"])
                .where("namespace", "=", this.namespace)
                .execute();
            return Object.fromEntries([
                ...keys.map<RecordItem<string, null>>((key) => [key, null]),
                ...result.map<RecordItem<string, TValue>>(({ key, value }) => [
                    key,
                    JSON.parse(value),
                ]),
            ]) as Record<TKey, TValue | null>;
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    private static AsyncLikeIterable = class<TValue>
        implements AsyncIterable<RecordItem<string, TValue>>
    {
        constructor(
            private db: Kysely<SqlKeyValueStorageTables>,
            private likePattern: string,
            private namespace: string,
        ) {}

        async *[Symbol.asyncIterator](): AsyncIterator<
            RecordItem<string, TValue>
        > {
            try {
                const stream = this.db
                    .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                    .select(["key", "value"])
                    .where("namespace", "=", this.namespace)
                    .where("key", "like", this.likePattern)
                    .stream();
                for await (const { key, value } of stream) {
                    yield [key, JSON.parse(value)];
                }
            } catch (error: unknown) {
                if (error instanceof KeyValueStorageError) {
                    throw error;
                }
                throw new UnexpectedKeyValueStorageError(
                    `Unexpected error "${String(error)}" occured`,
                    error,
                );
            }
        }
    };

    getStartsWithMany(
        keyPrefix: string,
    ): AsyncIterable<RecordItem<string, TValue>> {
        return new SqliteKeyValueStorage.AsyncLikeIterable(
            this.db,
            `${keyPrefix}%`,
            this.namespace,
        );
    }

    getEndsWithMany(
        keySuffix: string,
    ): AsyncIterable<RecordItem<string, TValue>> {
        return new SqliteKeyValueStorage.AsyncLikeIterable(
            this.db,
            `%${keySuffix}`,
            this.namespace,
        );
    }

    getIncludesMany(key: string): AsyncIterable<RecordItem<string, TValue>> {
        return new SqliteKeyValueStorage.AsyncLikeIterable(
            this.db,
            `%${key}%`,
            this.namespace,
        );
    }

    private static sqlClamp(
        value: RawBuilder<unknown>,
        { max, min }: ClampSettings = {},
    ): RawBuilder<unknown> {
        if (max && min) {
            return sql`min(max(${value}, ${min}), ${max})`;
        }
        if (min) {
            return sql`max(${value}, ${min})`;
        }
        if (max) {
            return sql`min(${value}, ${max})`;
        }
        return sql`${value}`;
    }

    private static sqlClampJsonValue(
        jsonValue: RawBuilder<unknown>,
        settings?: ClampSettings,
    ): RawBuilder<string> {
        jsonValue = sql`json(${jsonValue})`;
        return sql<string>`
        case
            when
                json_type(${jsonValue}) == 'real'
                or json_type(${jsonValue}) == 'integer'
            then
                json_quote(
                    ${SqliteKeyValueStorage.sqlClamp(sql`${jsonValue} ->> '$'`, settings)}
                )
            else ${jsonValue}
        end
        `;
    }

    async insertIfNotExistsMany<TKey extends string>(
        items: RecordItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, boolean>> {
        try {
            if (items.length === 0) {
                return {} as Record<TKey, boolean>;
            }
            const insertValues = items.map(([key, value]) => {
                return {
                    key,
                    value: SqliteKeyValueStorage.sqlClampJsonValue(
                        sql`${JSON.stringify(value)}`,
                        settings,
                    ),
                    namespace: this.namespace,
                };
            });

            const result = await this.db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values(insertValues)
                .onConflict((b) => b.columns(["key", "namespace"]).doNothing())
                .returning("key")
                .execute();

            return Object.fromEntries([
                ...items.map<RecordItem<string, boolean>>(([key]) => [
                    key,
                    false,
                ]),
                ...result.map<RecordItem<string, boolean>>(({ key }) => [
                    key,
                    true,
                ]),
            ]) as Record<TKey, boolean>;
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async updateIfExistsMany<TKey extends string>(
        updateValues: RecordItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<Record<TKey, boolean>> {
        try {
            if (updateValues.length === 0) {
                return {} as Record<TKey, boolean>;
            }
            const keys = updateValues.map(([key]) => key);

            const result = await this.db
                .updateTable(SQL_KV_STORAGE_TABLE_NAME)
                .set("value", (eb) => {
                    const [firstUpdateValue, ...restUpdateValues] =
                        updateValues;
                    if (!firstUpdateValue) {
                        throw new UnexpectedKeyValueStorageError(
                            "!!__message__!!",
                        );
                    }

                    const [firstKey, firstValue] = firstUpdateValue;
                    const initial = eb
                        .case()
                        .when("key", "=", firstKey)
                        .then(
                            SqliteKeyValueStorage.sqlClampJsonValue(
                                sql`${JSON.stringify(firstValue)}`,
                                settings,
                            ),
                        );
                    const caseQuery = restUpdateValues
                        .reduce((qb, [key, value]) => {
                            return qb
                                .when("key", "=", key)
                                .then(
                                    SqliteKeyValueStorage.sqlClampJsonValue(
                                        sql`${JSON.stringify(value)}`,
                                        settings,
                                    ),
                                );
                        }, initial)
                        .else("")
                        .end();
                    return caseQuery;
                })
                .where("namespace", "=", this.namespace)
                .where("key", "in", keys)
                .returning("key")
                .execute();

            return Object.fromEntries([
                ...updateValues.map<RecordItem<string, boolean>>(([key]) => [
                    key,
                    false,
                ]),
                ...result.map<RecordItem<string, boolean>>(({ key }) => [
                    key,
                    true,
                ]),
            ]) as Record<TKey, boolean>;
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async insertOrUpdateMany<TKey extends string>(
        items: InsertOrUpdateItem<TKey, TValue>[],
        settings?: ClampSettings,
    ): Promise<void> {
        try {
            if (items.length === 0) {
                return;
            }

            const insertValues = items.map(([key, { insertValue }]) => {
                return {
                    key,
                    value: SqliteKeyValueStorage.sqlClampJsonValue(
                        sql`${JSON.stringify(insertValue)}`,
                        settings,
                    ),
                    namespace: this.namespace,
                };
            });

            const query = this.db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values(insertValues)
                .onConflict((b) =>
                    b.columns(["key", "namespace"]).doUpdateSet((eb) => {
                        const [firstUpdateValue, ...restUpdateValues] =
                            items.map<RecordItem<TKey, TValue>>(
                                ([key, { updateValue }]) => [key, updateValue],
                            );
                        if (!firstUpdateValue) {
                            throw new UnexpectedKeyValueStorageError(
                                "!!__message__!!",
                            );
                        }

                        const [firstKey, firstValue] = firstUpdateValue;
                        const initial = eb
                            .case()
                            .when("key", "=", firstKey)
                            .then(
                                SqliteKeyValueStorage.sqlClampJsonValue(
                                    sql`${JSON.stringify(firstValue)}`,
                                    settings,
                                ),
                            );
                        const caseQuery = restUpdateValues
                            .reduce((qb, [key, value]) => {
                                return qb
                                    .when("key", "=", key)
                                    .then(
                                        SqliteKeyValueStorage.sqlClampJsonValue(
                                            sql`${JSON.stringify(value)}`,
                                            settings,
                                        ),
                                    );
                            }, initial)
                            .else("")
                            .end();
                        return {
                            key: eb.ref("key"),
                            namespace: eb.ref("namespace"),
                            value: caseQuery,
                        };
                    }),
                )
                .returning("key");
            await query.execute();
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async removeIfExistsMany<TKey extends string>(
        keys: TKey[],
    ): Promise<Record<TKey, boolean>> {
        try {
            if (keys.length === 0) {
                return {} as Record<TKey, boolean>;
            }
            const result = await this.db
                .deleteFrom(SQL_KV_STORAGE_TABLE_NAME)
                .where("namespace", "=", this.namespace)
                .where("key", "in", keys)
                .returning("key")
                .execute();

            return Object.fromEntries([
                ...keys.map<RecordItem<string, boolean>>((key) => [key, false]),
                ...result.map<RecordItem<string, boolean>>(({ key }) => [
                    key,
                    true,
                ]),
            ]) as Record<TKey, boolean>;
        } catch (error: unknown) {
            if (error instanceof KeyValueStorageError) {
                throw error;
            }
            throw new UnexpectedKeyValueStorageError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async transaction<TReturn>(
        transactionFn: (storage: IKeyValueStorage<TValue>) => Promise<TReturn>,
    ): Promise<TReturn> {
        return this.db.transaction().execute((trx) => {
            return transactionFn(
                new SqliteKeyValueStorage(trx, this.namespace),
            );
        });
    }
}

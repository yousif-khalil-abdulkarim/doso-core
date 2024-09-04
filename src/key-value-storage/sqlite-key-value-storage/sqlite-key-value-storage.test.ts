import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { SqliteKeyValueStorage } from "@/key-value-storage/sqlite-key-value-storage/_module";
import {
    type SqlKeyValueStorageTables,
    SQL_KV_STORAGE_TABLE_NAME,
} from "@/key-value-storage/_shared";
import { type RecordItem } from "@/_shared/types";

import SQLite, { type Database } from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

describe("class: SqliteKeyValueStorage", () => {
    let db: Kysely<SqlKeyValueStorageTables>;
    let sqlite: Database;

    beforeEach(async () => {
        sqlite = new SQLite(":memory:");
        db = new Kysely<SqlKeyValueStorageTables>({
            dialect: new SqliteDialect({
                database: new SQLite(":memory:"),
            }),
        });
        await SqliteKeyValueStorage.init(db);
    });
    afterEach(() => {
        sqlite.close();
    });
    describe("method: Symbol.asyncIterator", () => {
        test("Should return all key value pairs of a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const items: unknown[] = [];
            for await (const item of storage) {
                items.push(item);
            }

            expect(items).toStrictEqual([
                ["a", 1],
                ["b", 2],
            ]);
        });
        test("Should return empty array when given none existing namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "none_exsiting");

            const items: unknown[] = [];
            for await (const item of storage) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: clear", () => {
        test("Should remove all key value pairs of a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.clear();

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "value", "namespace"])
                .execute();

            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "c",
                    namespace: "user",
                    value: 2,
                },
            ]);
        });
        test("Should not remove any key value pairs of Map structure when given none existing namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "none_existing");

            await storage.clear();

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "c",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "global",
                    value: 1,
                },
            ]);
        });
    });
    describe("method: size", () => {
        test("Should return the amount of key value pairs of a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const size = await storage.size();

            expect(size).toStrictEqual(2);
        });
        test("Should return 0 when given none existing namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "none_exsiting");

            const size = await storage.size();

            expect(size).toStrictEqual(0);
        });
    });
    describe("method: hasMany", () => {
        test("Should return true for all the keys that exists for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const result = await storage.hasMany(["a", "b", "c"]);

            expect(result).toStrictEqual({
                a: true,
                b: true,
                c: false,
            });
        });
        test("Should return only false when given none existing namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "none_existing");

            const result = await storage.hasMany(["a", "b", "c"]);

            expect(result).toStrictEqual({
                a: false,
                b: false,
                c: false,
            });
        });
    });
    describe("method: getMany", () => {
        test("Should return the values for all the keys that exists for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const result = await storage.getMany(["a", "b", "c"]);

            expect(result).toStrictEqual({
                a: 1,
                b: 2,
                c: null,
            });
        });
        test("Should return only null when given none existing namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "none_existing");

            const result = await storage.getMany(["a", "b", "c"]);

            expect(result).toStrictEqual({
                a: null,
                b: null,
                c: null,
            });
        });
    });
    describe("method: getStartsWithMany", () => {
        test(`Should return all keys starts with "ab/" for a given namespace`, async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "ab/b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "ab/a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "ab/b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab/b",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab/a",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getStartsWithMany("ab/")) {
                items.push(item);
            }
            expect(items).toStrictEqual([
                ["ab/a", 1],
                ["ab/b", 2],
            ]);
        });
        test(`Should return empty array when no keys starts with "abc/" for a given namespace`, async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "ab/b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "ab/a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "ab/b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab/b",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab/a",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getStartsWithMany("abc/")) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: getEndsWithMany", () => {
        test(`Should return all keys ends with "/ab" for a given namespace`, async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "b/ab",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "ab/a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "ab/b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab/b",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab/a",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getEndsWithMany("/ab")) {
                items.push(item);
            }

            expect(items).toStrictEqual([
                ["a/ab", 1],
                ["b/ab", 2],
            ]);
        });
        test(`Should return empty array when no keys ends with "/abc" for a given namespace`, async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "b/ab",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "ab/a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "ab/b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab/b",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab/a",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getEndsWithMany("/abc")) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: getIncludesMany", () => {
        test(`Should return all keys includes "/ab/" for a given namespace`, async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a/ab/b",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "ab/a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "ab/b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab/b",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab/a",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getIncludesMany("/ab/")) {
                items.push(item);
            }

            expect(items).toStrictEqual([
                ["a/ab/b", 1],
                ["b/ab/a", 2],
            ]);
        });
        test(`Should return empty array when no keys match "/abc/" for a given namespace`, async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a/ab/b",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a/ab/b",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b/ab/a",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getIncludesMany("/abc/")) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: insertIfNotExistsMany", () => {
        test("Should return true for all keys that do not exists for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const result = await storage.insertIfNotExistsMany([
                ["a", -1],
                ["c", 3],
                ["d", 4],
                ["e", 5],
            ]);

            expect(result).toStrictEqual({
                a: false,
                c: true,
                d: true,
                e: true,
            });
        });
        test("Should insert all the keys that do not exist for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.insertIfNotExistsMany([
                ["a", -1],
                ["c", 3],
                ["d", 4],
                ["e", 5],
            ]);

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "global",
                    value: 2,
                },
                {
                    key: "c",
                    namespace: "global",
                    value: 3,
                },
                {
                    key: "d",
                    namespace: "global",
                    value: 4,
                },
                {
                    key: "e",
                    namespace: "global",
                    value: 5,
                },
            ]);
        });
        test("Should clamp inserted number value when over max for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.insertIfNotExistsMany([["a", 20]], { max: 10 });

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 10,
                },
            ]);
        });
        test("Should clamp inserted number value when under min for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.insertIfNotExistsMany([["a", 5]], { min: 10 });

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 10,
                },
            ]);
        });
    });
    describe("method: updateIfExistsMany", () => {
        test("Should return true for all keys that do exists for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "user",
                        value: JSON.stringify(4),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "e",
                        namespace: "global",
                        value: JSON.stringify(3),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const result = await storage.updateIfExistsMany([
                ["d", -20],
                ["a", -1],
                ["c", -2],
                ["e", -3],
            ]);

            expect(result).toStrictEqual({
                d: false,
                a: true,
                c: true,
                e: true,
            });
        });
        test("Should update all the keys that do exist for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "user",
                        value: JSON.stringify(4),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "c",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "e",
                        namespace: "global",
                        value: JSON.stringify(3),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.updateIfExistsMany([
                ["d", -20],
                ["a", -1],
                ["c", -2],
                ["e", -3],
            ]);

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "d",
                    namespace: "user",
                    value: 4,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: -1,
                },
                {
                    key: "c",
                    namespace: "global",
                    value: -2,
                },
                {
                    key: "e",
                    namespace: "global",
                    value: -3,
                },
            ]);
        });
        test("Should clamp updated number value when over max for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(0),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.updateIfExistsMany([["a", 20]], { max: 10 });

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 10,
                },
            ]);
        });
        test("Should clamp updated number value when under min for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(0),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.updateIfExistsMany([["a", 5]], { min: 10 });

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 10,
                },
            ]);
        });
    });
    describe("method: insertOrUpdateMany", () => {
        test("Should insert values for keys that do not exist", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.insertOrUpdateMany([
                [
                    "a",
                    {
                        insertValue: 1,
                        updateValue: -2,
                    },
                ],
                [
                    "b",
                    {
                        insertValue: 2,
                        updateValue: -2,
                    },
                ],
            ]);

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "global",
                    value: 2,
                },
            ]);
        });
        test("Should update values for keys that do exist", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(0),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(0),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.insertOrUpdateMany([
                [
                    "a",
                    {
                        insertValue: 1,
                        updateValue: -1,
                    },
                ],
                [
                    "b",
                    {
                        insertValue: 2,
                        updateValue: -2,
                    },
                ],
            ]);

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: -1,
                },
                {
                    key: "b",
                    namespace: "global",
                    value: -2,
                },
            ]);
        });
        test("Should clamp inserted or updated number value when over max for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(0),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.insertOrUpdateMany(
                [
                    [
                        "a",
                        {
                            insertValue: 50,
                            updateValue: 50,
                        },
                    ],
                    [
                        "b",
                        {
                            insertValue: 50,
                            updateValue: 50,
                        },
                    ],
                ],
                {
                    max: 20,
                },
            );

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 20,
                },
                {
                    key: "b",
                    namespace: "global",
                    value: 20,
                },
            ]);
        });
        test("Should clamp inserted or updated number value when under min for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(0),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.insertOrUpdateMany(
                [
                    [
                        "a",
                        {
                            insertValue: 10,
                            updateValue: 10,
                        },
                    ],
                    [
                        "b",
                        {
                            insertValue: 10,
                            updateValue: 10,
                        },
                    ],
                ],
                {
                    min: 20,
                },
            );

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "a",
                    namespace: "global",
                    value: 20,
                },
                {
                    key: "b",
                    namespace: "global",
                    value: 20,
                },
            ]);
        });
    });
    describe("method: removeIfExistsMany", () => {
        test("Should return true for all keys that do exists for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const result = await storage.removeIfExistsMany(["d", "a", "b"]);

            expect(result).toStrictEqual({
                d: false,
                a: true,
                b: true,
            });
        });
        test("Should remove all the keys that do exist for a given namespace", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "user",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "d",
                        namespace: "user",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                    {
                        key: "b",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                    {
                        key: "c",
                        namespace: "global",
                        value: JSON.stringify(2),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            await storage.removeIfExistsMany(["d", "a", "b"]);

            const result = await db
                .selectFrom(SQL_KV_STORAGE_TABLE_NAME)
                .select(["key", "namespace", "value"])
                .execute();
            expect(
                result.map((item) => ({
                    ...item,
                    value: JSON.parse(item.value) as unknown,
                })),
            ).toStrictEqual([
                {
                    key: "a",
                    namespace: "user",
                    value: 1,
                },
                {
                    key: "b",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "d",
                    namespace: "user",
                    value: 2,
                },
                {
                    key: "c",
                    namespace: "global",
                    value: 2,
                },
            ]);
        });
    });
    describe("method: transaction", () => {
        test("Should return a value", async () => {
            await db
                .insertInto(SQL_KV_STORAGE_TABLE_NAME)
                .values([
                    {
                        key: "a",
                        namespace: "global",
                        value: JSON.stringify(1),
                    },
                ])
                .execute();
            const storage = new SqliteKeyValueStorage(db, "global");

            const result = await storage.transaction(async (storage) =>
                storage.getMany(["a"]),
            );

            expect(result).toStrictEqual({ a: 1 });
        });
    });
});

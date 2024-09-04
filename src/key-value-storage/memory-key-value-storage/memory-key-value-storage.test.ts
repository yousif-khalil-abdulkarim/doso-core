import { describe, expect, test } from "vitest";
import { MemoryKeyValueStorage } from "@/key-value-storage/memory-key-value-storage/_module";
import { type RecordItem } from "@/_shared/types";

describe("class: MemoryKeyValueStorage", () => {
    describe("method: Symbol.asyncIterator", () => {
        test("Should return all key value pairs of a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

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
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "none_exsiting");

            const items: unknown[] = [];
            for await (const item of storage) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: clear", () => {
        test("Should remove all key value pairs of a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.clear();

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                }),
            );
        });
        test("Should not remove anny key value pairs of Map structure when given none existing namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "none_existing");

            await storage.clear();

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
        });
    });
    describe("method: size", () => {
        test("Should return the amount of key value pairs of a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            const size = await storage.size();

            expect(size).toStrictEqual(2);
        });
        test("Should return 0 when given none existing namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "none_exsiting");

            const size = await storage.size();

            expect(size).toStrictEqual(0);
        });
    });
    describe("method: getMany", () => {
        test("Should return the values for all the keys that exists for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            const result = await storage.getMany(["a", "b", "c"]);

            expect(result).toStrictEqual({
                a: 1,
                b: 2,
                c: null,
            });
        });
        test("Should return only null when given none existing namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "none_existing");

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
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "ab/b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "ab/a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "ab/b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab/b", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab/a", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

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
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "ab/b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "ab/a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "ab/b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab/b", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab/a", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getStartsWithMany("abc/")) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: getEndsWithMany", () => {
        test(`Should return all keys ends with "/ab" for a given namespace`, async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "b/ab", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "ab/a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "ab/b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab/b", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab/a", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

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
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "b/ab", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "ab/a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "ab/b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab/b", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab/a", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getEndsWithMany("/abc")) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: getIncludesMany", () => {
        test(`Should return all keys includes "/ab/" for a given namespace`, async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "b/ab/a", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "ab/a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "ab/b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab/b", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab/a", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

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
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "b/ab/a", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "ab/a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "ab/b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a/ab/b", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b/ab/a", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            const items: RecordItem<string, unknown>[] = [];
            for await (const item of storage.getIncludesMany("/abc/")) {
                items.push(item);
            }

            expect(items).toStrictEqual([]);
        });
    });
    describe("method: insertIfNotExistsMany", () => {
        test("Should return true for all keys that do not exists for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

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
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.insertIfNotExistsMany([
                ["a", -1],
                ["c", 3],
                ["d", 4],
                ["e", 5],
            ]);

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "c", namespace: "global" })]:
                        JSON.stringify(3),
                    [JSON.stringify({ key: "d", namespace: "global" })]:
                        JSON.stringify(4),
                    [JSON.stringify({ key: "e", namespace: "global" })]:
                        JSON.stringify(5),
                }),
            );
        });
        test("Should clamp inserted number value when over max for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.insertIfNotExistsMany([["a", 20]], { max: 10 });

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(10),
                }),
            );
        });
        test("Should clamp inserted number value when under min for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.insertIfNotExistsMany([["a", 5]], { min: 10 });

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(10),
                }),
            );
        });
    });
    describe("method: updateIfExistsMany", () => {
        test("Should return true for all keys that do exists for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "user" })]:
                        JSON.stringify(4),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "e", namespace: "global" })]:
                        JSON.stringify(3),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

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
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "user" })]:
                        JSON.stringify(4),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "c", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "e", namespace: "global" })]:
                        JSON.stringify(3),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.updateIfExistsMany([
                ["d", -20],
                ["a", -1],
                ["c", -2],
                ["e", -3],
            ]);

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "user" })]:
                        JSON.stringify(4),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(-1),
                    [JSON.stringify({ key: "c", namespace: "global" })]:
                        JSON.stringify(-2),
                    [JSON.stringify({ key: "e", namespace: "global" })]:
                        JSON.stringify(-3),
                }),
            );
        });
        test("Should clamp updated number value when over max for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(0),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.updateIfExistsMany([["a", 20]], { max: 10 });

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(10),
                }),
            );
        });
        test("Should clamp updated number value when under min for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(0),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.updateIfExistsMany([["a", 5]], { min: 10 });

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(10),
                }),
            );
        });
    });
    describe("method: removeIfExistsMany", () => {
        test("Should return true for all keys that do exists for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            const result = await storage.removeIfExistsMany(["d", "a", "b"]);

            expect(result).toStrictEqual({
                d: false,
                a: true,
                b: true,
            });
        });
        test("Should remove all the keys that do exist for a given namespace", async () => {
            const map = new Map<string, string>(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "a", namespace: "global" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "global" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "c", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
            const storage = new MemoryKeyValueStorage(map, "global");

            await storage.removeIfExistsMany(["d", "a", "b"]);

            expect([...map.entries()]).toStrictEqual(
                Object.entries({
                    [JSON.stringify({ key: "a", namespace: "user" })]:
                        JSON.stringify(1),
                    [JSON.stringify({ key: "b", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "d", namespace: "user" })]:
                        JSON.stringify(2),
                    [JSON.stringify({ key: "c", namespace: "global" })]:
                        JSON.stringify(2),
                }),
            );
        });
    });
});

export const SQL_KV_STORAGE_TABLE_NAME = "key_value";
export type SqlKeyValueStorageTables = {
    [k in typeof SQL_KV_STORAGE_TABLE_NAME]: {
        key: string;
        namespace: string;
        value: string;
    };
};

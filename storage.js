// storage.js
// Central log in Azure Table Storage. Cheap, serverless, perfect for an
// append-mostly Q&A log. Single partition keeps "newest first" trivial and is
// fine for internal volumes; swap to Cosmos DB if you ever need heavy querying.

import { TableClient } from "@azure/data-tables";

const TABLE = "AskCormacLog";
const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!conn) console.warn("AZURE_STORAGE_CONNECTION_STRING not set — logging will fail.");

const client = TableClient.fromConnectionString(conn, TABLE);
const ready = client.createTable().catch(() => {}); // idempotent: ignore "already exists"

// RowKey encodes a reverse timestamp so ascending RowKey order == newest first.
const MAX_MS = 99_999_999_999_999; // 14-digit ceiling, sortable as a string
const rowKey = (id, atMs) => `${(MAX_MS - atMs).toString().padStart(14, "0")}-${id}`;

export async function appendEntry({ user, q, a, category, flag }) {
  await ready;
  const atMs = Date.now();
  const id = `${atMs}-${Math.random().toString(36).slice(2, 7)}`;
  const entity = {
    partitionKey: "log",
    rowKey: rowKey(id, atMs),
    id,
    user: user || "anonymous",
    q,
    a,
    category: category || "answer",
    flag: !!flag,
    at: new Date(atMs).toISOString(),
    rating: "",   // 'good' | 'needs'
    note: "",     // Cormac's correction
  };
  await client.createEntity(entity);
  return strip(entity);
}

export async function listEntries({ filter = "all", limit = 500 } = {}) {
  await ready;
  const out = [];
  const iter = client.listEntities({ queryOptions: { filter: "PartitionKey eq 'log'" } });
  for await (const e of iter) {
    if (filter === "flagged" && !e.flag) continue;
    if (filter === "rated" && !e.rating) continue;
    out.push(strip(e));
    if (out.length >= limit) break; // RowKey order = newest first
  }
  return out;
}

export async function updateEntry(id, patch) {
  await ready;
  const iter = client.listEntities({
    queryOptions: { filter: `PartitionKey eq 'log' and id eq '${id.replace(/'/g, "''")}'` },
  });
  for await (const e of iter) {
    const merge = { partitionKey: e.partitionKey, rowKey: e.rowKey };
    if (patch.rating !== undefined) merge.rating = patch.rating || "";
    if (patch.note !== undefined) merge.note = patch.note || "";
    await client.updateEntity(merge, "Merge");
    return true;
  }
  return false;
}

const strip = (e) => ({
  id: e.id,
  user: e.user,
  q: e.q,
  a: e.a,
  category: e.category,
  flag: e.flag,
  at: e.at,
  rating: e.rating || null,
  note: e.note || "",
});

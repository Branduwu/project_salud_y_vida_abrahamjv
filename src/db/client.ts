import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;
type DatabaseState = { db: Database; pool: Pool };

export function createLazyDatabaseClient(readConnectionString = () => process.env.DATABASE_URL) {
  let database: DatabaseState | undefined;

  function getDatabase() {
    if (database) return database;
    const connectionString = readConnectionString();
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is required when a server-side database operation is requested.",
      );
    }
    const pool = new Pool({ connectionString });
    database = { db: drizzle({ client: pool, schema }), pool };
    return database;
  }

  const db = new Proxy({} as Database, {
    get(_target, property) {
      const value = Reflect.get(getDatabase().db, property);
      return typeof value === "function" ? value.bind(getDatabase().db) : value;
    },
  });

  return {
    db,
    async close() {
      if (!database) return;
      const { pool } = database;
      database = undefined;
      await pool.end();
    },
  };
}

const client = createLazyDatabaseClient();
export const db = client.db;
export async function closeDatabase() {
  await client.close();
}

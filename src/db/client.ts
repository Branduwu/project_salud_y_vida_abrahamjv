import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to access the database");
  }

  const pool = new Pool({ connectionString });
  return { db: drizzle({ client: pool, schema }), pool };
}

const database = createDatabase();

export const db = database.db;

export async function closeDatabase() {
  await database.pool.end();
}

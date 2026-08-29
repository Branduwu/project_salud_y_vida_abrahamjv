import "dotenv/config";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { closeDatabase, db } from "./client";
import { requireDatabaseUrl, setupProductionData } from "./production-data";

async function runMigrations() {
  const drizzleCli = fileURLToPath(
    new URL("../../node_modules/drizzle-kit/bin.cjs", import.meta.url),
  );
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [drizzleCli, "migrate"], {
      env: process.env,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`db:setup migration step failed with exit code ${code ?? "unknown"}.`));
    });
  });
}

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const lockPool = new Pool({ connectionString: databaseUrl });
  try {
    const lockClient = await lockPool.connect();
    try {
      await lockClient.query("SELECT pg_advisory_lock(hashtext('salud-y-vida:db:setup'))");
      await db.execute(sql`SELECT 1`);
      console.log("PostgreSQL connection: OK");
      await closeDatabase();

      await runMigrations();
      const summary = await setupProductionData();
      console.log("db:setup complete");
      console.log(
        `roles=${summary.roles} categories=${summary.categories} products=${summary.products} images=${summary.images} branches=${summary.branches} inventory=${summary.inventory}`,
      );
      console.log("Inventory was not initialized: NEEDS BUSINESS DECISION.");
    } finally {
      await closeDatabase();
      await lockClient.query("SELECT pg_advisory_unlock(hashtext('salud-y-vida:db:setup'))");
      lockClient.release();
    }
  } finally {
    await lockPool.end();
  }
}

main().catch(() => {
  console.error(
    "db:setup failed. PostgreSQL connection, migrations, or validation did not complete.",
  );
  process.exitCode = 1;
});

import "dotenv/config";
import { closeDatabase } from "@/db/client";
import { createOrPromoteAdmin } from "@/server/admin-bootstrap-service";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run admin:create.");
  }
  if (!process.env.ADMIN_BOOTSTRAP_EMAIL) {
    throw new Error("ADMIN_BOOTSTRAP_EMAIL is required to run admin:create.");
  }

  const result = await createOrPromoteAdmin({
    email: process.env.ADMIN_BOOTSTRAP_EMAIL,
    name: process.env.ADMIN_BOOTSTRAP_NAME,
    password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
  });

  console.info(`Administrator ${result.status}: ${result.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(
      "Administrator bootstrap failed.",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(closeDatabase);

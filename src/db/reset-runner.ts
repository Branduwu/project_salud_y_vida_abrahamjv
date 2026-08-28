import "dotenv/config";
import { closeDatabase } from "./client";
import { resetDatabase } from "./reset";

resetDatabase()
  .then(() => console.info("Database reset completed."))
  .catch((error: unknown) => {
    console.error("Database reset failed.", error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);

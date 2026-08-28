import "dotenv/config";
import { closeDatabase } from "./client";
import { seedDatabase } from "./seed";

seedDatabase()
  .then(() => console.info("Demo seed completed."))
  .catch((error: unknown) => {
    console.error("Demo seed failed.", error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);

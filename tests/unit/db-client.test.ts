import { describe, expect, it } from "vitest";
import { createLazyDatabaseClient } from "@/db/client";

describe("lazy database client", () => {
  it("ENV-U-001: permits importing and constructing a client without DATABASE_URL", async () => {
    const client = createLazyDatabaseClient(() => undefined);
    await expect(client.close()).resolves.toBeUndefined();
    expect(() => client.db.select).toThrow(
      "DATABASE_URL is required when a server-side database operation is requested.",
    );
  });

  it("DEPLOY-I-001: reads connection configuration only when DB is accessed", () => {
    let reads = 0;
    const client = createLazyDatabaseClient(() => {
      reads += 1;
      return undefined;
    });
    expect(reads).toBe(0);
    expect(() => client.db.execute).toThrow(
      "DATABASE_URL is required when a server-side database operation is requested.",
    );
    expect(reads).toBe(1);
  });
});

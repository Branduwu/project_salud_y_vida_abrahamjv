import { describe, expect, it } from "vitest";
import {
  runVercelBuild,
  sanitizeBuildOutput,
  shouldRunProductionSetup,
  type ScriptRunner,
} from "@/cli/vercel-build-service";

function runner() {
  const calls: string[] = [];
  const run: ScriptRunner = async (script) => {
    calls.push(script);
  };
  return { calls, run };
}

describe("Vercel production database build", () => {
  it("VERCEL-DB-001: production executes db setup before build", async () => {
    const { calls, run } = runner();
    await runVercelBuild({ VERCEL_ENV: "production", DATABASE_URL: "postgres://test" }, run);
    expect(calls).toEqual(["db:setup", "build"]);
  });

  it("VERCEL-DB-002: preview skips db setup", async () => {
    const { calls, run } = runner();
    await runVercelBuild({ VERCEL_ENV: "preview" }, run);
    expect(calls).toEqual(["build"]);
  });

  it("VERCEL-DB-003: development skips db setup", async () => {
    const { calls, run } = runner();
    await runVercelBuild({ VERCEL_ENV: "development" }, run);
    expect(calls).toEqual(["build"]);
    expect(shouldRunProductionSetup({})).toBe(false);
  });

  it("VERCEL-DB-004: production without DATABASE_URL fails", async () => {
    const { calls, run } = runner();
    await expect(runVercelBuild({ VERCEL_ENV: "production" }, run)).rejects.toThrow(
      "Production database is not configured.",
    );
    expect(calls).toEqual([]);
  });

  it("VERCEL-DB-005: setup failure stops build", async () => {
    const calls: string[] = [];
    const run: ScriptRunner = async (script) => {
      calls.push(script);
      if (script === "db:setup") throw new Error("setup failed");
    };
    await expect(
      runVercelBuild({ VERCEL_ENV: "production", DATABASE_URL: "postgres://test" }, run),
    ).rejects.toThrow("setup failed");
    expect(calls).toEqual(["db:setup"]);
  });

  it("VERCEL-DB-006: db:seed is never called in production", async () => {
    const { calls, run } = runner();
    await runVercelBuild({ VERCEL_ENV: "production", DATABASE_URL: "postgres://test" }, run);
    expect(calls).not.toContain("db:seed");
  });

  it("VERCEL-DB-007: secret output is sanitized", () => {
    const environment = {
      DATABASE_URL: "postgres://name:password@example.test/database",
      AUTH_SECRET: "auth-secret-value",
    };
    const output = sanitizeBuildOutput(
      `failed for ${environment.DATABASE_URL} with ${environment.AUTH_SECRET}`,
      environment,
    );
    expect(output).not.toContain("password");
    expect(output).not.toContain(environment.AUTH_SECRET);
    expect(output).toContain("[REDACTED_DATABASE_URL]");
  });
});

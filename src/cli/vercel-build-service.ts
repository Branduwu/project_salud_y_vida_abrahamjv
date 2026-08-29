export type ScriptRunner = (script: "db:setup" | "build") => Promise<void>;

type BuildEnvironment = Readonly<Record<string, string | undefined>>;

export function shouldRunProductionSetup(environment: BuildEnvironment) {
  return environment.VERCEL_ENV === "production";
}

export function sanitizeBuildOutput(value: string, environment: BuildEnvironment) {
  let sanitized = value.replace(/postgres(?:ql)?:\/\/[^\s'"`]+/gi, "[REDACTED_DATABASE_URL]");
  for (const secret of [environment.DATABASE_URL, environment.AUTH_SECRET]) {
    if (secret) sanitized = sanitized.replaceAll(secret, "[REDACTED_SECRET]");
  }
  return sanitized;
}

export async function runVercelBuild(environment: BuildEnvironment, runScript: ScriptRunner) {
  if (shouldRunProductionSetup(environment)) {
    if (!environment.DATABASE_URL?.trim()) {
      throw new Error("Production database is not configured.");
    }
    await runScript("db:setup");
  }
  await runScript("build");
}

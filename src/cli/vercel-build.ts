import { spawn } from "node:child_process";
import { runVercelBuild, sanitizeBuildOutput, type ScriptRunner } from "./vercel-build-service";

const useWindowsCommandShell = process.platform === "win32";
const npmCommand = useWindowsCommandShell ? (process.env.ComSpec ?? "cmd.exe") : "npm";

const runScript: ScriptRunner = (script) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      npmCommand,
      useWindowsCommandShell ? ["/d", "/s", "/c", `npm run ${script}`] : ["run", script],
      {
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const writeOutput = (value: Buffer) =>
      process.stdout.write(sanitizeBuildOutput(value.toString(), process.env));
    const writeError = (value: Buffer) =>
      process.stderr.write(sanitizeBuildOutput(value.toString(), process.env));
    child.stdout.on("data", writeOutput);
    child.stderr.on("data", writeError);
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Vercel build step '${script}' failed.`));
    });
  });

runVercelBuild(process.env, runScript).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Vercel build failed.";
  console.error(sanitizeBuildOutput(message, process.env));
  process.exitCode = 1;
});

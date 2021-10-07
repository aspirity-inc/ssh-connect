import { promises as fsp } from "fs";
import { dirname, resolve as resolvePath } from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";

async function loadPackageJson() {
  const filePath = fileURLToPath(import.meta.url);
  const dirPath = dirname(filePath);
  const packageJsonPath = resolvePath(dirPath, "package.json");
  const packageJsonContent = await fsp.readFile(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonContent);
  return packageJson;
}

async function loadDependenciesNames() {
  const { dependencies } = await loadPackageJson();
  const depNames = Object.keys(dependencies);
  return depNames;
}

(async () => {
  console.log("👷🔨‍ build started");
  const buildTimerLabel = "👷✅‍ build completed";
  console.time(buildTimerLabel);

  const depNames = await loadDependenciesNames();
  await esbuild.build({
    entryPoints: ["src/server.ts"],
    outfile: "dist/ssh-connect.js",
    platform: "node",
    external: depNames,
    bundle: true,
    sourcemap: true,
    format: "esm",
  });

  console.timeEnd(buildTimerLabel);
})();

import { readFile, writeFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const match = String(packageJson.version).match(/^(\d+)\.(\d+)\.(\d+)$/);
if (!match) throw new Error("package.json version must use MAJOR.MINOR.PATCH");

const [, majorText, minorText, patchText] = match;
const major = Number(majorText);
const minor = Number(minorText);
const patch = Number(patchText);
const versionCode = major * 10000 + minor * 100 + patch;

if (!Number.isSafeInteger(versionCode) || versionCode < 1 || versionCode > 2100000000) {
  throw new Error("Calculated Android versionCode is outside the supported range");
}

const gradleUrl = new URL("../android/app/build.gradle", import.meta.url);
let gradle = await readFile(gradleUrl, "utf8");
if (!/\bversionCode\s+\d+/.test(gradle) || !/\bversionName\s+"[^"]+"/.test(gradle)) {
  throw new Error("Could not find versionCode/versionName in android/app/build.gradle");
}

gradle = gradle
  .replace(/\bversionCode\s+\d+/, "versionCode " + versionCode)
  .replace(/\bversionName\s+"[^"]+"/, 'versionName "' + packageJson.version + '"');

await writeFile(gradleUrl, gradle, "utf8");
console.log("Android version set to " + packageJson.version + " (versionCode " + versionCode + ")");

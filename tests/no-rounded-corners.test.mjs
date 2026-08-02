import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const srcRoot = path.resolve("src");

async function cssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const location = path.join(directory, entry.name);
      if (entry.isDirectory()) return cssFiles(location);
      return entry.name.endsWith(".css") ? [location] : [];
    }),
  );
  return nested.flat();
}

test("all frontend border radii use square corners", async () => {
  const failures = [];

  for (const file of await cssFiles(srcRoot)) {
    const css = await readFile(file, "utf8");
    for (const match of css.matchAll(/border-radius\s*:\s*([^;}\n]+)/gi)) {
      const value = match[1].trim();
      if (value !== "0") {
        failures.push(`${path.relative(srcRoot, file)}: ${value}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

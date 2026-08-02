import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src",
);

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(fullPath);
      return /\.(?:js|jsx|css)$/.test(entry.name) ? [fullPath] : [];
    }),
  );
  return nested.flat();
}

test("frontend contains category-only UI and API code", async () => {
  const files = await sourceFiles(root);
  const offenders = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    if (/subcategor/i.test(source) || /subcategor/i.test(path.basename(file))) {
      offenders.push(path.relative(root, file));
    }
  }

  assert.deepEqual(offenders, []);
});

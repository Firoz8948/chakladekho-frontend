import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("mobile headings are increased by two pixels", async () => {
  const css = await readFile(
    new URL("../src/styles/globals.css", import.meta.url),
    "utf8",
  );

  for (const token of ["--text-2xl", "--text-xl", "--text-lg"]) {
    assert.match(
      css,
      new RegExp(`font-size:\\s*calc\\(var\\(${token}\\) \\+ 2px\\);`),
    );
  }
});

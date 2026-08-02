import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("review authors render without initial avatar icons", async () => {
  const component = await readFile(
    new URL("src/pages-components/home/Testimonials.jsx", root),
    "utf8",
  );

  assert.doesNotMatch(component, /styles\.avatar/);
  assert.doesNotMatch(component, /charAt\(0\)/);
  assert.match(component, /<strong>\{review\.name\}<\/strong>/);
  assert.match(component, /<span>\{review\.city\}<\/span>/);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shopPagePath = new URL("../src/app/shop/page.jsx", import.meta.url);
const shopStylesPath = new URL(
  "../src/app/shop/shop.module.css",
  import.meta.url,
);
const gridStylesPath = new URL(
  "../src/pages-components/shop/ProductGrid.module.css",
  import.meta.url,
);

test("shop loads fifteen products per infinite-scroll batch", async () => {
  const source = await readFile(shopPagePath, "utf8");

  assert.match(source, /const PRODUCTS_PER_BATCH = 15;/);
  assert.match(source, /page_size:\s*PRODUCTS_PER_BATCH/);
  assert.match(source, /new IntersectionObserver/);
  assert.match(source, /setPage\(\(current\) => current \+ 1\)/);
  assert.match(source, /items:\s*\[\.\.\.current\.items,\s*\.\.\.response\.items\]/s);
  assert.doesNotMatch(source, />\s*Previous\s*</);
  assert.doesNotMatch(source, />\s*Next\s*</);
});

test("desktop shop uses a sticky left sidebar and three-column grid", async () => {
  const [shopCss, gridCss] = await Promise.all([
    readFile(shopStylesPath, "utf8"),
    readFile(gridStylesPath, "utf8"),
  ]);

  assert.match(shopCss, /\.desktopSidebar\s*\{[^}]*position:\s*sticky;/s);
  assert.match(shopCss, /\.shopLayout\s*\{[^}]*grid-template-columns:/s);
  assert.match(
    gridCss,
    /@media\s*\(min-width:\s*861px\)[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  );
});

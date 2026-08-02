import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("desktop category label is rendered inside the image box", async () => {
  const component = await readFile(
    new URL("src/pages-components/home/CategorySection.jsx", root),
    "utf8",
  );

  assert.doesNotMatch(component, />Browse</);
  assert.match(component, /Explore Our Categories/);
  assert.match(component, /Find the right kitchen essential for every recipe/);
  assert.match(
    component,
    /className=\{styles\.catImgWrap\}[\s\S]*className=\{styles\.catLabel\}[\s\S]*<\/div>/,
  );
  assert.match(component, /className=\{styles\.catArrow\}[^>]*>[\s\S]*→/);
});

test("category label animates on hover and keyboard focus", async () => {
  const css = await readFile(
    new URL("src/pages-components/home/CategorySection.module.css", root),
    "utf8",
  );

  assert.match(css, /\.catCard:hover\s+\.catLabel/);
  assert.match(css, /\.catCard:focus-visible\s+\.catLabel/);
  assert.match(css, /\.catLabel\s*\{[\s\S]*opacity:\s*0/);
  assert.match(css, /\.catLabel\s*\{[^}]*background:\s*transparent/);
  assert.match(css, /transition:/);
});

test("desktop category rows center incomplete groups with tight gaps", async () => {
  const css = await readFile(
    new URL("src/pages-components/home/CategorySection.module.css", root),
    "utf8",
  );

  assert.match(
    css,
    /\.desktopRow\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap;[^}]*justify-content:\s*center;/s,
  );
  assert.match(
    css,
    /\.desktopRow\s*\{[^}]*gap:\s*var\(--space-2\)/,
  );
  assert.match(
    css,
    /@media \(min-width:\s*1100px\)[\s\S]*\.catCard\s*\{[^}]*flex-basis:\s*calc\(\(100%\s*-\s*3\s*\*\s*var\(--space-2\)\)\s*\/\s*4\)/,
  );
  assert.match(css, /\.catImgWrap\s*\{[\s\S]*aspect-ratio:\s*1\s*\/\s*1/);
});

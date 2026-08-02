import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const navbarPath = new URL(
  "../src/components/Navbar/Navbar.jsx",
  import.meta.url,
);
const stylesPath = new URL(
  "../src/components/Navbar/Navbar.module.css",
  import.meta.url,
);

test("desktop navbar uses icon-labelled navigation and a category mega menu", async () => {
  const navbar = await readFile(navbarPath, "utf8");

  assert.match(navbar, /FiHome/);
  assert.match(navbar, /FiGrid/);
  assert.match(navbar, /FiShoppingBag/);
  assert.match(navbar, /FiInfo/);
  assert.match(navbar, /FiPhone/);
  assert.match(navbar, />\s*Categories\s*</);
  assert.match(navbar, /aria-expanded=\{categoriesOpen\}/);
  assert.match(navbar, /className=\{styles\.megaMenu\}/);
  assert.match(navbar, /categories\.map\(\(cat\)/);
  assert.match(navbar, /href="\/shop"/);
  assert.match(navbar, /href="\/about"/);
  assert.match(navbar, /href="\/contact"/);
  assert.match(navbar, /styles\.aboutDesktop/);
  assert.doesNotMatch(
    navbar,
    /onMouseLeave=\{\(\) => setCategoriesOpen\(false\)\}/,
  );
});

test("desktop menu items are borderless and category panel spans the viewport", async () => {
  const css = await readFile(stylesPath, "utf8");

  assert.match(css, /\.navMenuItem\s*\{[^}]*border:\s*none;/s);
  assert.match(css, /\.navMenuItem\s*\{[^}]*background:\s*transparent;/s);
  assert.match(css, /\.megaMenu\s*\{[^}]*left:\s*0;[^}]*right:\s*0;/s);
  assert.match(
    css,
    /\.desktopRight\s*\{[^}]*grid-column:\s*3;[^}]*display:\s*flex;/s,
  );
  assert.doesNotMatch(css, /\.aboutDesktop\s*\{[^}]*position:\s*absolute;/s);
  assert.match(
    css,
    /\.megaCategoryTitle\s*\{[^}]*justify-content:\s*flex-start;/s,
  );
  assert.match(
    css,
    /\.desktopNavWrap\s*\{[^}]*justify-content:\s*flex-end;/s,
  );
  assert.match(
    css,
    /\.megaMenuGrid\s*\{[^}]*column-gap:\s*clamp\(/s,
  );
});

test("mobile navbar hides desktop About link and keeps logo centered", async () => {
  const css = await readFile(stylesPath, "utf8");

  assert.match(
    css,
    /@media \(max-width: 860px\) \{[\s\S]*?\.aboutDesktop\s*\{[^}]*display:\s*none;/,
  );
  assert.match(
    css,
    /@media \(max-width: 860px\) \{[\s\S]*?\.logo\s*\{[^}]*position:\s*absolute;[^}]*left:\s*50%;/,
  );
  assert.match(
    css,
    /@media \(max-width: 860px\) \{[\s\S]*?\.logoImage\s*\{[^}]*height:\s*52px;/,
  );
});

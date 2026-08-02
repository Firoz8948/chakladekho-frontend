import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("featured products CTA uses square corners", async () => {
  const component = await readFile(
    new URL("src/pages-components/home/FeaturedProducts.jsx", root),
    "utf8",
  );
  const css = await readFile(
    new URL("src/pages-components/home/FeaturedProducts.module.css", root),
    "utf8",
  );

  assert.match(css, /\.ctaBtn\s*\{[^}]*border-radius:\s*0/);
  assert.match(component, /className=\{styles\.ctaArrow\}[^>]*>[\s\S]*→/);
});

test("featured products uses equal top and bottom section padding", async () => {
  const css = await readFile(
    new URL("src/pages-components/home/FeaturedProducts.module.css", root),
    "utf8",
  );

  assert.match(
    css,
    /\.featuredSection\s*\{[^}]*padding-block:\s*var\(--space-20\);/s,
  );
});

test("desktop navbar buttons use square corners", async () => {
  const css = await readFile(
    new URL("src/components/Navbar/Navbar.module.css", root),
    "utf8",
  );

  assert.match(css, /\.loginBtn\s*\{[^}]*border-radius:\s*0/);
  assert.match(
    css,
    /@media\s*\(min-width:\s*861px\)[\s\S]*?\.navLink\s*\{[^}]*border-radius:\s*0/,
  );
});

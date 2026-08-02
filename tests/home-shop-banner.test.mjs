import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("home page renders a shop banner before Why Choose Us", async () => {
  const page = await readFile(new URL("src/app/page.jsx", root), "utf8");

  const bannerIndex = page.indexOf("<ShopCollectionBanner");
  const whyChooseIndex = page.indexOf("<WhyChooseUs");

  assert.ok(bannerIndex >= 0, "ShopCollectionBanner is missing from the home page");
  assert.ok(
    bannerIndex < whyChooseIndex,
    "ShopCollectionBanner must render before WhyChooseUs",
  );
});

test("shop banner links to the complete product catalogue", async () => {
  const banner = await readFile(
    new URL(
      "src/pages-components/home/ShopCollectionBanner.jsx",
      root,
    ),
    "utf8",
  );

  assert.match(banner, /href=["']\/shop["']/);
  assert.match(banner, /Explore All Products/i);
  assert.match(banner, /src=["']\/assets\/videos\/ctavideo\.mp4["']/);
  assert.match(banner, /IntersectionObserver/);
  assert.match(banner, /\.play\(\)/);

  const titleIndex = banner.indexOf("styles.title");
  const copyIndex = banner.indexOf("styles.copy");
  const videoIndex = banner.indexOf("<video");
  const ctaIndex = banner.indexOf('href="/shop"');

  assert.ok(titleIndex < copyIndex);
  assert.ok(copyIndex < videoIndex);
  assert.ok(videoIndex < ctaIndex);
});

test("collection video has decorative tape on opposite corners", async () => {
  const css = await readFile(
    new URL(
      "src/pages-components/home/ShopCollectionBanner.module.css",
      root,
    ),
    "utf8",
  );

  assert.match(css, /\.videoFrame::before,\s*\.videoFrame::after/);
  assert.match(css, /\.videoFrame\s*\{[^}]*overflow:\s*visible;/s);
  assert.match(css, /\.videoFrame::before\s*\{[^}]*top:[^}]*left:/s);
  assert.match(css, /\.videoFrame::after\s*\{[^}]*right:[^}]*bottom:/s);
  assert.match(
    css,
    /@media \(max-width: 768px\) \{[\s\S]*?\.videoFrame::before,\s*\.videoFrame::after\s*\{[^}]*display:\s*none;/,
  );
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("mobile explore categories is a horizontal row without dropdown icons", async () => {
  const component = await readFile(
    new URL("src/pages-components/home/CategorySection.jsx", root),
    "utf8",
  );
  const css = await readFile(
    new URL("src/pages-components/home/CategorySection.module.css", root),
    "utf8",
  );

  assert.doesNotMatch(component, /styles\.accChevron/);
  assert.doesNotMatch(
    component,
    /className=\{styles\.accItem\}[\s\S]*›/,
  );
  assert.match(
    css,
    /\.mobileList\s*\{[^}]*flex-direction:\s*row;[^}]*overflow-x:\s*auto;/s,
  );
});

test("home renders a mobile-only alternating category showcase before Why Choose Us", async () => {
  const page = await readFile(new URL("src/app/page.jsx", root), "utf8");
  const component = await readFile(
    new URL("src/pages-components/home/MobileCategoryShowcase.jsx", root),
    "utf8",
  );
  const css = await readFile(
    new URL(
      "src/pages-components/home/MobileCategoryShowcase.module.css",
      root,
    ),
    "utf8",
  );

  assert.match(page, /MobileCategoryShowcase[\s\S]*WhyChooseUs/);
  assert.match(component, /cat\.description/);
  assert.match(component, /Shop Now/);
  assert.match(component, /\/shop\?category=\$\{cat\.slug\}/);
  assert.match(css, /@media \(min-width:\s*769px\)[\s\S]*display:\s*none/);
  assert.match(css, /mask-image|filter:\s*blur/);
  assert.match(css, /\.rowReverse|\.flip|odd|even|alternate/i);
});

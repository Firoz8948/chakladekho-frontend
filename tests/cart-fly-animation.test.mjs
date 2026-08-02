import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("add to cart uses a flying disc layer instead of only a green tick toast", async () => {
  const cart = await readFile(
    new URL("src/context/CartContext.jsx", root),
    "utf8",
  );
  const fly = await readFile(
    new URL("src/components/CartFlyLayer/CartFlyLayer.jsx", root),
    "utf8",
  );
  const css = await readFile(
    new URL("src/components/CartFlyLayer/CartFlyLayer.module.css", root),
    "utf8",
  );

  assert.match(cart, /flyToCart|CartFlyLayer/);
  assert.doesNotMatch(cart, /toast\.success\("Added to cart"\)/);
  assert.match(fly, /moving-disc|createPortal|data-cart-target/);
  assert.match(css, /@keyframes\s+move|@keyframes\s+fly/);
  assert.match(css, /movingDisc|moving-disc|\.disc/i);
});
